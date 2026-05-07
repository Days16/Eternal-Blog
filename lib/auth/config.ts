import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { getSupabaseAuthClient, getSupabaseServerClient } from '@/lib/supabase/server'
import { mapUser } from '@/lib/supabase/helpers'
import type { NextAuthConfig } from 'next-auth'

const dbUserSchema = z.object({
  role:     z.string().nullable().optional(),
  level:    z.number().int().positive().nullable().optional(),
  xp:       z.number().int().min(0).nullable().optional(),
  username: z.string().nullable().optional(),
})

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn:  '/login',
    signOut: '/login',
    error:   '/login',
  },
  providers: [
    Credentials({
      name: 'Credenciales',
      credentials: {
        email:    { label: 'Correo',    type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        // anon key para autenticar — la service role key es rechazada por este endpoint
        const authClient = getSupabaseAuthClient()
        if (!authClient) return null
        const { data, error } = await authClient.auth.signInWithPassword({ email, password })
        if (error || !data.user?.email) return null

        // service role para leer/escribir en la tabla users (bypassa RLS)
        const supabase = getSupabaseServerClient()
        if (!supabase) return null

        const username = String(data.user.user_metadata?.username ?? data.user.email.split('@')[0]).toLowerCase()
        const name = String(data.user.user_metadata?.name ?? username)

        const { data: existingProfile } = await supabase
          .from('users')
          .select('id,name,email,username,role,level,xp,special_role')
          .eq('id', data.user.id)
          .maybeSingle()

        let profile = existingProfile

        if (!profile) {
          const { data: createdProfile } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              username,
              name,
              role: 'reader',
              level: 1,
              xp: 15,
            }, { onConflict: 'id' })
            .select('id,name,email,username,role,level,xp,special_role')
            .maybeSingle()

          profile = createdProfile
        } else if (!profile.email || !profile.username || !profile.name) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: profile.email ?? data.user.email,
              username: profile.username ?? username,
              name: profile.name ?? name,
            }, { onConflict: 'id', ignoreDuplicates: false })
            .select('id,name,email,username,role,level,xp,special_role')
            .maybeSingle()

          if (updateError) console.error('[auth] profile update error:', updateError?.message)
          profile = updatedProfile ?? profile
        }

        const user = profile ? mapUser(profile) : {
          id: data.user.id,
          name,
          email: data.user.email,
          level: 1,
          xp: 15,
          role: 'reader',
          username,
        }

        return {
          id:       user.id,
          name:     user.name ?? name,
          email:    user.email ?? data.user.email,
          level:    user.level,
          xp:       user.xp,
          role:     user.role ?? undefined,
          username: user.username ?? username,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.level    = user.level ?? 1
        token.xp       = user.xp ?? 0
        token.role     = user.role ?? 'reader'
        token.username = user.username ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Obtenemos los datos frescos desde la base de datos para asegurar
        // que el rol y otros campos cambien inmediatamente en la sesión tras recargar
        try {
          const supabase = getSupabaseServerClient()
          if (supabase && token.id) {
            const { data } = await supabase
              .from('users')
              .select('role, level, xp, username')
              .eq('id', token.id as string)
              .maybeSingle()
              
            if (data) {
              const parsed = dbUserSchema.safeParse(data)
              if (parsed.success) {
                token.role     = parsed.data.role     ?? token.role
                token.level    = parsed.data.level    ?? token.level
                token.xp       = parsed.data.xp       ?? token.xp
                token.username = parsed.data.username ?? token.username
              }
            }
          }
        } catch (error) {
          console.error('[auth] Error sincronizando sesión:', error instanceof Error ? error.message : 'unknown')
        }

        session.user.id       = token.id as string
        session.user.level    = token.level as number
        session.user.xp       = token.xp as number
        session.user.role     = token.role as string
        session.user.username = token.username as string | null
      }
      return session
    },
  },
}
