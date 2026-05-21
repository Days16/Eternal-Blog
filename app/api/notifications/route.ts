import { auth } from '@/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { mapActivity } from '@/lib/supabase/helpers'
import { getUserNotifications, markAllNotificationsRead } from '@/lib/supabase/queries/notifications'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = getSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })

  const userId = session.user.id

  const [activityRows, socialNotifs] = await Promise.all([
    supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    getUserNotifications(userId),
  ])

  const activityItems = (activityRows.data ?? []).map(row => ({
    ...mapActivity(row),
    source: 'activity' as const,
  }))

  const socialItems = socialNotifs.map(n => ({
    ...n,
    source: 'social' as const,
  }))

  const merged = [...activityItems, ...socialItems].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  )

  return NextResponse.json(merged)
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  await markAllNotificationsRead(session.user.id)
  return NextResponse.json({ ok: true })
}
