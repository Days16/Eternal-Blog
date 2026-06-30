'use server'

import { getSession } from '@/lib/auth/session'
import { requireSupabase } from '@/lib/supabase/helpers'
import { sanitizeCommentHtml, stripHtml } from '@/lib/utils/sanitize'
import { awardXP } from '@/lib/xp/award'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { followThread, getThreadFollowers } from '@/lib/supabase/queries/forum'
import { createNotification } from '@/lib/supabase/queries/notifications'

const XP_THREAD = 10
const XP_REPLY = 5

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login')
  return session.user
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createThreadAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const user = await requireAuth()
  const supabase = requireSupabase()

  const categoryId = text(formData, 'category_id')
  const categorySlug = text(formData, 'category_slug')
  const title = text(formData, 'title')
  const body = sanitizeCommentHtml(text(formData, 'body'))

  if (!title || title.length < 5) return 'El título debe tener al menos 5 caracteres.'
  if (!stripHtml(body).replaceAll('&nbsp;', '').trim()) return 'El cuerpo del hilo no puede estar vacío.'
  if (!categoryId) return 'Categoría inválida.'

  const baseSlug = slugify(title)
  let slug = baseSlug
  let tries = 0

  while (tries < 10) {
    const { data: existing } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!existing) break
    tries++
    slug = `${baseSlug}-${tries}`
  }

  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert({
      slug,
      title,
      body,
      author_id: user.id,
      category_id: categoryId,
      pinned: false,
      locked: false,
      views: 0,
    })
    .select('id,slug')
    .single()

  if (error) return 'Error al crear el hilo. Inténtalo de nuevo.'

  try {
    await awardXP(user.id, XP_THREAD, 'comment', thread.id)
  } catch {}

  try {
    await followThread(user.id, thread.id)
  } catch (e) {
    console.error('[forum] Auto-follow thread failed:', e)
  }

  revalidateTag('forum')
  revalidatePath(`/foro/${categorySlug}`)

  redirect(`/foro/${categorySlug}/${thread.slug}`)
}

export async function createReplyAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const user = await requireAuth()
  const supabase = requireSupabase()

  const threadId = text(formData, 'thread_id')
  const categorySlug = text(formData, 'category_slug')
  const threadSlug = text(formData, 'thread_slug')
  const parentId = text(formData, 'parent_id') || null
  const body = sanitizeCommentHtml(text(formData, 'body'))

  if (!stripHtml(body).replaceAll('&nbsp;', '').trim()) return 'La respuesta no puede estar vacía.'
  if (!threadId) return 'Hilo inválido.'

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id,locked')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread) return 'Hilo no encontrado.'
  if (thread.locked) return 'Este hilo está cerrado y no acepta nuevas respuestas.'

  const { error } = await supabase
    .from('forum_replies')
    .insert({
      thread_id: threadId,
      user_id: user.id,
      body,
      parent_id: parentId,
      deleted: false,
    })

  if (error) return 'Error al enviar la respuesta. Inténtalo de nuevo.'

  // Disparar notificaciones a los seguidores del hilo
  try {
    const followers = await getThreadFollowers(threadId)
    const otherFollowers = followers.filter(f => f !== user.id)

    if (otherFollowers.length > 0) {
      const { data: tInfo } = await supabase
        .from('forum_threads')
        .select('title')
        .eq('id', threadId)
        .maybeSingle()

      const title = tInfo?.title || 'un hilo que sigues'

      await Promise.all(
        otherFollowers.map(followerId =>
          createNotification({
            userId: followerId,
            actorId: user.id,
            type: 'forum_reply',
            data: {
              threadId,
              threadSlug,
              categorySlug,
              title,
            },
          }).catch(e => console.error(`[forum] Error notifying user ${followerId}:`, e))
        )
      )
    }
  } catch (notifErr) {
    console.error('[forum] Failed to process followers notifications:', notifErr)
  }

  try {
    await awardXP(user.id, XP_REPLY, 'comment', threadId)
  } catch {}

  revalidatePath(`/foro/${categorySlug}/${threadSlug}`)

  return null
}

export async function deleteThreadAction(formData: FormData) {
  const user = await requireAuth()
  const session = await getSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'dev' || session?.user?.role === 'moderator'
  const supabase = requireSupabase()

  const threadId = text(formData, 'thread_id')
  const categorySlug = text(formData, 'category_slug')

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id,author_id')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread) return
  if (!isAdmin && thread.author_id !== user.id) return

  await supabase.from('forum_replies').delete().eq('thread_id', threadId)
  await supabase.from('forum_threads').delete().eq('id', threadId)

  revalidateTag('forum')
  revalidatePath(`/foro/${categorySlug}`)
  redirect(`/foro/${categorySlug}`)
}

export async function deleteReplyAction(formData: FormData) {
  const user = await requireAuth()
  const session = await getSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'dev' || session?.user?.role === 'moderator'
  const supabase = requireSupabase()

  const replyId = text(formData, 'reply_id')
  const categorySlug = text(formData, 'category_slug')
  const threadSlug = text(formData, 'thread_slug')

  const { data: reply } = await supabase
    .from('forum_replies')
    .select('id,user_id')
    .eq('id', replyId)
    .maybeSingle()

  if (!reply) return
  if (!isAdmin && reply.user_id !== user.id) return

  await supabase
    .from('forum_replies')
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq('id', replyId)

  revalidatePath(`/foro/${categorySlug}/${threadSlug}`)
}

export async function togglePinThreadAction(formData: FormData) {
  const session = await getSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'dev' || session?.user?.role === 'moderator'
  if (!isAdmin) return

  const supabase = requireSupabase()
  const threadId = text(formData, 'thread_id')
  const currentPinned = formData.get('pinned') === 'true'
  const categorySlug = text(formData, 'category_slug')
  const threadSlug = text(formData, 'thread_slug')

  await supabase
    .from('forum_threads')
    .update({ pinned: !currentPinned })
    .eq('id', threadId)

  revalidatePath(`/foro/${categorySlug}`)
  revalidatePath(`/foro/${categorySlug}/${threadSlug}`)
}

export async function toggleLockThreadAction(formData: FormData) {
  const session = await getSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'dev' || session?.user?.role === 'moderator'
  if (!isAdmin) return

  const supabase = requireSupabase()
  const threadId = text(formData, 'thread_id')
  const currentLocked = formData.get('locked') === 'true'
  const categorySlug = text(formData, 'category_slug')
  const threadSlug = text(formData, 'thread_slug')

  await supabase
    .from('forum_threads')
    .update({ locked: !currentLocked })
    .eq('id', threadId)

  revalidatePath(`/foro/${categorySlug}`)
  revalidatePath(`/foro/${categorySlug}/${threadSlug}`)
}

export async function toggleFollowThreadAction(threadId: string, shouldFollow: boolean) {
  const user = await requireAuth()
  const { unfollowThread } = await import('@/lib/supabase/queries/forum')
  if (shouldFollow) {
    await followThread(user.id, threadId)
  } else {
    await unfollowThread(user.id, threadId)
  }
}
