import { requireSupabase } from '@/lib/supabase/helpers'

export interface SocialNotification {
  id: string
  type: string
  actorId: string | null
  actorName: string | null
  actorUsername: string | null
  actorAvatarUrl: string | null
  data: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export async function createNotification(params: {
  userId: string
  actorId: string
  type: string
  data?: Record<string, unknown>
}) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id:  params.userId,
      actor_id: params.actorId,
      type:     params.type,
      data:     params.data ?? {},
    })
  if (error) throw new Error(`[notifications] ${error.message}`)
}

export async function getUserNotifications(userId: string): Promise<SocialNotification[]> {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('notifications')
    .select('id,type,actor_id,data,read_at,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[notifications] getUserNotifications error:', error.message)
    return []
  }

  // Fetch actor names in a second query to avoid FK name ambiguity
  const actorIds = [...new Set((data ?? []).map(r => r.actor_id).filter(Boolean))] as string[]
  const actorMap: Record<string, { name: string | null; username: string | null; avatarUrl: string | null }> = {}

  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('users')
      .select('id,name,username,avatar_url')
      .in('id', actorIds)
    for (const a of actors ?? []) {
      actorMap[a.id] = { name: a.name ?? null, username: a.username ?? null, avatarUrl: a.avatar_url ?? null }
    }
  }

  return (data ?? []).map(row => ({
    id:             String(row.id),
    type:           String(row.type),
    actorId:        row.actor_id ?? null,
    actorName:      row.actor_id ? (actorMap[row.actor_id]?.name ?? null) : null,
    actorUsername:  row.actor_id ? (actorMap[row.actor_id]?.username ?? null) : null,
    actorAvatarUrl: row.actor_id ? (actorMap[row.actor_id]?.avatarUrl ?? null) : null,
    data:           (row.data ?? {}) as Record<string, unknown>,
    readAt:         row.read_at ?? null,
    createdAt:      String(row.created_at),
  }))
}

export async function markNotificationRead(notifId: string, userId: string) {
  const supabase = requireSupabase()
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notifId)
    .eq('user_id', userId)
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = requireSupabase()
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const supabase = requireSupabase()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)
  return count ?? 0
}
