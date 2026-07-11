import { createSupabaseServerClient } from '@/lib/supabase/ssr'
import { redirect } from 'next/navigation'

export type AppUser = {
  id: string
  name: string | null
  email: string | null
  username: string | null
  role: string
  level: number
  xp: number
  avatarUrl: string | null
  bio: string | null
}

export type AppSession = { user: AppUser }

export async function getSession(): Promise<AppSession | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('id,name,username,email,role,level,xp,avatar_url,bio')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.id) return null

    return {
      user: {
        id: profile.id,
        name: profile.name ?? null,
        email: profile.email ?? user.email ?? null,
        username: profile.username ?? null,
        role: profile.role ?? 'reader',
        level: profile.level ?? 1,
        xp: profile.xp ?? 0,
        avatarUrl: profile.avatar_url ?? null,
        bio: profile.bio ?? null,
      }
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<AppSession> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(...roles: string[]): Promise<AppSession> {
  const session = await requireAuth()
  if (!roles.includes(session.user.role)) redirect('/')
  return session
}
