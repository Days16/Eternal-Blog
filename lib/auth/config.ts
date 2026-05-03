import Credentials from 'next-auth/providers/credentials'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { mapUser } from '@/lib/supabase/helpers'
import type { NextAuthConfig } from 'next-auth'

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
        const supabase = getSupabaseServerClient()
        if (!supabase) return null

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.user?.email) return null

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
          const { data: updatedProfile } = await supabase
            .from('users')
            .update({
              email: profile.email ?? data.user.email,
              username: profile.username ?? username,
              name: profile.name ?? name,
            })
            .eq('id', data.user.id)
            .select('id,name,email,username,role,level,xp,special_role')
            .maybeSingle()

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
          name:     user.name,
          email:    user.email,
          level:    user.level,
          xp:       user.xp,
          role:     user.role ?? undefined,
          username: user.username,
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
