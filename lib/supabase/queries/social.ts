import { requireSupabase } from '@/lib/supabase/helpers'
import { createNotification } from '@/lib/supabase/queries/notifications'

// ─── Seguimiento ─────────────────────────────────────────────────────────────

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error('No puedes seguirte a ti mismo.')
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('follows')
    .upsert({ follower_id: followerId, following_id: followingId }, { onConflict: 'follower_id,following_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()
  return !!data
}

export async function getFollowCounts(userId: string) {
  const supabase = requireSupabase()
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { followers: followersCount ?? 0, following: followingCount ?? 0 }
}

// ─── Amistades ───────────────────────────────────────────────────────────────

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error('No puedes enviarte una solicitud a ti mismo.')
  const supabase = requireSupabase()

  const { data: existing } = await supabase
    .from('friendships')
    .select('id,status')
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'accepted') throw new Error('Ya sois amigos.')
    if (existing.status === 'pending')  throw new Error('Ya existe una solicitud pendiente.')
    // rechazada → actualizar a pending
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { data: inserted, error } = await supabase
    .from('friendships')
    .insert({ sender_id: senderId, receiver_id: receiverId })
    .select('id')
    .single()
  if (error) throw error

  await createNotification({
    userId:  receiverId,
    actorId: senderId,
    type:    'friend_request',
    data:    { friendshipId: inserted.id },
  }).catch(e => console.error('[social] friend_request notification failed:', e.message))
}

export async function respondFriendRequest(friendshipId: string, userId: string, status: 'accepted' | 'rejected') {
  const supabase = requireSupabase()
  const { data: fs } = await supabase
    .from('friendships')
    .select('id,sender_id,receiver_id,status')
    .eq('id', friendshipId)
    .maybeSingle()

  if (!fs) throw new Error('Solicitud no encontrada.')
  if (fs.receiver_id !== userId) throw new Error('No tienes permiso para responder a esta solicitud.')
  if (fs.status !== 'pending') throw new Error('Esta solicitud ya fue procesada.')

  const { error } = await supabase
    .from('friendships')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
  if (error) throw error

  if (status === 'accepted') {
    await createNotification({
      userId:  fs.sender_id,
      actorId: userId,
      type:    'friend_accepted',
      data:    {},
    }).catch(e => console.error('[social] friend_accepted notification failed:', e.message))
  }
}

export async function getFriends(userId: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('friendships')
    .select('id,sender_id,receiver_id,created_at,sender:users!friendships_sender_id_fkey(id,name,username,avatar_url),receiver:users!friendships_receiver_id_fkey(id,name,username,avatar_url)')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

  return (data ?? []).map(row => {
    const sender   = row.sender   as unknown as { id: string; name: string | null; username: string | null; avatar_url: string | null } | null
    const receiver = row.receiver as unknown as { id: string; name: string | null; username: string | null; avatar_url: string | null } | null
    const friend = sender?.id === userId ? receiver : sender
    return {
      friendshipId: row.id,
      userId: friend?.id ?? '',
      name: friend?.name ?? null,
      username: friend?.username ?? null,
      avatarUrl: friend?.avatar_url ?? null,
    }
  })
}

export async function cancelFriendRequest(senderId: string, receiverId: string) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')
  if (error) throw error
}

export async function getPendingFriendRequests(userId: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('friendships')
    .select('id,sender_id,created_at,sender:users!friendships_sender_id_fkey(id,name,username,avatar_url)')
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => {
    const sender = row.sender as unknown as { id: string; name: string | null; username: string | null; avatar_url: string | null } | null
    return {
      friendshipId: row.id,
      senderId: row.sender_id,
      name: sender?.name ?? null,
      username: sender?.username ?? null,
      avatarUrl: sender?.avatar_url ?? null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
    }
  })
}

export async function getFriendshipStatus(userA: string, userB: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('friendships')
    .select('id,status,sender_id')
    .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
    .maybeSingle()

  if (!data) return null
  return {
    id: data.id,
    status: data.status as 'pending' | 'accepted' | 'rejected',
    isSender: data.sender_id === userA,
  }
}

// ─── Mensajería directa ──────────────────────────────────────────────────────

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
    .maybeSingle()
  return !!data
}

export async function sendMessage(senderId: string, receiverId: string, body: string) {
  if (senderId === receiverId) throw new Error('No puedes enviarte mensajes a ti mismo.')
  if (!body.trim()) throw new Error('El mensaje no puede estar vacío.')
  if (body.length > 2000) throw new Error('El mensaje es demasiado largo.')

  const friends = await areFriends(senderId, receiverId)
  if (!friends) throw new Error('Solo puedes enviar mensajes a tus amigos.')

  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, body: body.trim() })
    .select('id,sender_id,receiver_id,body,read_at,created_at')
    .single()

  if (error) throw error
  return data
}

export async function getMessages(userId: string, partnerId: string, limit = 40) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('direct_messages')
    .select('id,sender_id,receiver_id,body,read_at,created_at')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`,
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).reverse().map(row => ({
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    body: row.body,
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  }))
}

export async function markMessagesRead(userId: string, partnerId: string) {
  const supabase = requireSupabase()
  await supabase
    .from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', partnerId)
    .is('read_at', null)
}

export async function getConversations(userId: string) {
  const supabase = requireSupabase()

  const friends = await getFriends(userId)
  if (friends.length === 0) return []

  const partnerIds = friends.map(f => f.userId)

  const { data: lastMessages } = await supabase
    .from('direct_messages')
    .select('id,sender_id,receiver_id,body,read_at,created_at')
    .or(
      partnerIds
        .map(pid => `and(sender_id.eq.${userId},receiver_id.eq.${pid}),and(sender_id.eq.${pid},receiver_id.eq.${userId})`)
        .join(','),
    )
    .order('created_at', { ascending: false })

  type DmRow = { id: string; sender_id: string; receiver_id: string; body: string; read_at: string | null; created_at: string }
  const lastByPartner = new Map<string, DmRow>()
  for (const msg of (lastMessages ?? []) as DmRow[]) {
    const partner = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    if (!lastByPartner.has(partner)) lastByPartner.set(partner, msg)
  }

  const { data: unreadCounts } = await supabase
    .from('direct_messages')
    .select('sender_id')
    .eq('receiver_id', userId)
    .in('sender_id', partnerIds)
    .is('read_at', null)

  const unread = new Map<string, number>()
  for (const row of unreadCounts ?? []) {
    unread.set(row.sender_id, (unread.get(row.sender_id) ?? 0) + 1)
  }

  return friends.map(friend => {
    const last = lastByPartner.get(friend.userId)
    return {
      userId: friend.userId,
      name: friend.name,
      username: friend.username,
      avatarUrl: friend.avatarUrl,
      lastMessage: last ? { body: last.body, createdAt: new Date(last.created_at) } : null,
      unreadCount: unread.get(friend.userId) ?? 0,
    }
  }).sort((a, b) => {
    const ta = a.lastMessage?.createdAt?.getTime() ?? 0
    const tb = b.lastMessage?.createdAt?.getTime() ?? 0
    return tb - ta
  })
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = requireSupabase()
  const { count } = await supabase
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null)
  return count ?? 0
}
