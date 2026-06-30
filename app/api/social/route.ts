import { getSession } from '@/lib/auth/session'
import {
  followUser, unfollowUser, isFollowing,
  sendFriendRequest, respondFriendRequest, cancelFriendRequest,
  sendMessage, getMessages, markMessagesRead,
  getConversations,
} from '@/lib/supabase/queries/social'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('follow'),           targetId: z.string().uuid() }),
  z.object({ action: z.literal('unfollow'),         targetId: z.string().uuid() }),
  z.object({ action: z.literal('friend_request'),   targetId: z.string().uuid() }),
  z.object({ action: z.literal('friend_cancel'),    targetId: z.string().uuid() }),
  z.object({ action: z.literal('friend_respond'),   friendshipId: z.string().uuid(), status: z.enum(['accepted', 'rejected']) }),
  z.object({ action: z.literal('send_message'),     receiverId: z.string().uuid(), body: z.string().min(1).max(2000) }),
  z.object({ action: z.literal('mark_read'),        partnerId: z.string().uuid() }),
])

export async function POST(request: Request) {
  let session
  try { session = await getSession() } catch { return NextResponse.json({ error: 'Error de sesión.' }, { status: 500 }) }
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = actionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = session.user.id
  const data = parsed.data

  try {
    switch (data.action) {
      case 'follow':
        await followUser(userId, data.targetId)
        return NextResponse.json({ ok: true })

      case 'unfollow':
        await unfollowUser(userId, data.targetId)
        return NextResponse.json({ ok: true })

      case 'friend_request':
        await sendFriendRequest(userId, data.targetId)
        return NextResponse.json({ ok: true })

      case 'friend_cancel':
        await cancelFriendRequest(userId, data.targetId)
        return NextResponse.json({ ok: true })

      case 'friend_respond':
        await respondFriendRequest(data.friendshipId, userId, data.status)
        return NextResponse.json({ ok: true })

      case 'send_message': {
        const msg = await sendMessage(userId, data.receiverId, data.body)
        return NextResponse.json({ message: msg }, { status: 201 })
      }

      case 'mark_read':
        await markMessagesRead(userId, data.partnerId)
        return NextResponse.json({ ok: true })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar la acción.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  let session
  try { session = await getSession() } catch { return NextResponse.json({ error: 'Error de sesión.' }, { status: 500 }) }
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const userId = session.user.id

  try {
    if (type === 'conversations') {
      const conversations = await getConversations(userId)
      return NextResponse.json({ conversations })
    }

    if (type === 'messages') {
      const partnerId = searchParams.get('partnerId')
      if (!partnerId) return NextResponse.json({ error: 'partnerId requerido.' }, { status: 400 })
      const messages = await getMessages(userId, partnerId)
      return NextResponse.json({ messages })
    }

    if (type === 'is_following') {
      const targetId = searchParams.get('targetId')
      if (!targetId) return NextResponse.json({ error: 'targetId requerido.' }, { status: 400 })
      const following = await isFollowing(userId, targetId)
      return NextResponse.json({ following })
    }

    return NextResponse.json({ error: 'Tipo de consulta no reconocido.' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
