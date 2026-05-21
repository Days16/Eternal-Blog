import { requireSupabase } from '@/lib/supabase/helpers'

export interface SocialNotification {
  id: string
  type: string
  actorId: string | null
  actorName: string | null
  actorUsername: string | null
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
  if (error) console.error('[notifications] createNotification error:', error.message)
}

export async function getUserNotifications(userId: string): Promise<SocialNotification[]> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('notifications')
    .select('id,type,actor_id,data,read_at,created_at,actor:users!notifications_actor_id_fkey(id,name,username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  return (data ?? []).map(row => {
    const actor = row.actor as unknown as { id: string; name: string | null; username: string | null } | null
    return {
      id:            String(row.id),
      type:          String(row.type),
      actorId:       row.actor_id ?? null,
      actorName:     actor?.name ?? null,
      actorUsername: actor?.username ?? null,
      data:          (row.data ?? {}) as Record<string, unknown>,
      readAt:        row.read_at ?? null,
      createdAt:     String(row.created_at),
    }
  })
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
