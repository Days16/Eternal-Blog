'use server'

import { auth } from '@/auth'
import { requireSupabase } from '@/lib/supabase/helpers'
import { awardXP } from '@/lib/xp/award'
import { slugify } from '@/lib/utils/slugify'
import { isValidRole } from '@/lib/auth/roles'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendNewEntryEmail } from '@/lib/email/resend'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

async function notifySubscribers(
  entryTitle: string,
  entrySlug: string,
  entryType: 'chronicle' | 'codex',
  entryExcerpt?: string | null,
) {
  try {
    const supabase = requireSupabase()
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('notify_new_posts', true)
      .not('email', 'is', null)
    const emails = (data ?? []).map(r => r.email as string).filter(Boolean)
    if (emails.length === 0) return
    await sendNewEntryEmail({ to: emails, entryTitle, entrySlug, entryType, entryExcerpt })
  } catch {
    // fire-and-forget: no bloquear la publicación si falla el email
  }
}

function tiptapDocFromText(value: string) {
  const paragraphs = value.split(/\n{2,}/).map(part => part.trim()).filter(Boolean)
  return JSON.stringify({
    type: 'doc',
    content: paragraphs.length ? paragraphs.map(paragraph => ({ type: 'paragraph', content: [{ type: 'text', text: paragraph }] })) : [{ type: 'paragraph' }],
  })
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

async function requireAdminUser() {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user?.id || (role !== 'admin' && role !== 'moderator' && role !== 'dev')) redirect('/login')
  return session.user
}

export async function saveEntryAction(formData: FormData) {
  const user = await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const title = text(formData, 'title')
  const rawBody = text(formData, 'body')
  const type = text(formData, 'type') === 'codex' ? 'codex' : 'chronicle'
  const status = ['draft', 'published', 'archived'].includes(text(formData, 'status')) ? text(formData, 'status') as 'draft' | 'published' | 'archived' : 'draft'
  const slug = slugify(text(formData, 'slug') || title)
  const excerpt = text(formData, 'excerpt') || null
  const category = type === 'codex' ? text(formData, 'category') || null : null
  const tags = JSON.stringify(text(formData, 'tags').split(',').map(tag => tag.trim()).filter(Boolean))
  const body = tiptapDocFromText(rawBody)
  const words = wordCount(rawBody)
  const now = new Date()

  if (!title || !slug) throw new Error('Título y slug son obligatorios')

  if (id) {
    const { data: existing } = await supabase
      .from('entries')
      .select('status,type,author_id')
      .eq('id', id)
      .maybeSingle()

    await supabase
      .from('entries')
      .update({
        title,
        slug,
        type,
        excerpt,
        category,
        tags,
        body,
        status,
        word_count: words,
        published_at: status === 'published' ? now.toISOString() : null,
        updated_at: now.toISOString(),
      })
      .eq('id', id)

    if (status === 'published' && existing?.status !== 'published') {
      await awardXP(existing?.author_id ?? user.id, type === 'chronicle' ? 50 : 40, 'entry_published', id)
      void notifySubscribers(title, slug, type, excerpt)
    }
  } else {
    const newId = crypto.randomUUID()
    await supabase.from('entries').insert({
      id: newId,
      title,
      slug,
      type,
      excerpt,
      category,
      tags,
      body,
      status,
      word_count: words,
      author_id: user.id,
      published_at: status === 'published' ? now.toISOString() : null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    if (status === 'published') {
      await awardXP(user.id, type === 'chronicle' ? 50 : 40, 'entry_published', newId)
      void notifySubscribers(title, slug, type, excerpt)
    }
  }

  revalidatePath('/admin/entradas')
  revalidatePath('/cronicas')
  revalidatePath('/codex')
  redirect('/admin/entradas')
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const role = text(formData, 'role')
  
  if (!id || !isValidRole(role)) return

  try {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('[admin] Error actualizando rol:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    throw new Error(`No se pudo actualizar el rol del usuario: ${message}`)
  }

  revalidatePath('/admin/usuarios')
}

export async function adjustUserXpAction(formData: FormData) {
  await requireAdminUser()
  const id = text(formData, 'id')
  const delta = Number(text(formData, 'delta'))
  if (!id || !Number.isFinite(delta) || delta === 0) return
  await awardXP(id, delta, 'mission_completed', 'admin-adjustment')
  revalidatePath('/admin/usuarios')
}

export async function saveAchievementAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const name = text(formData, 'name')
  if (!name) throw new Error('El nombre es obligatorio')

  const VALID_CRITERIA = ['comment_count', 'reaction_given', 'entry_published', 'xp_total', 'easter_egg_found', 'easter_egg_all', 'level_reached']
  const criteriaType = text(formData, 'criteriaType')
  if (!VALID_CRITERIA.includes(criteriaType)) throw new Error('Tipo de criterio inválido')

  const patch = {
    name,
    slug: slugify(text(formData, 'slug') || name),
    description: text(formData, 'description') || null,
    rune_glyph: text(formData, 'runeGlyph') || 'ᛟ',
    color: text(formData, 'color') || 'var(--spore)',
    criteria_type: criteriaType,
    criteria_value: criteriaType === 'easter_egg_all' ? 0 : Math.max(1, Number(text(formData, 'criteriaValue')) || 1),
    xp_reward: Math.max(0, Number(text(formData, 'xpReward')) || 0),
  }

  if (id) {
    await supabase.from('achievements').update(patch).eq('id', id)
  } else {
    await supabase.from('achievements').insert(patch)
  }

  revalidatePath('/admin/logros')
  redirect('/admin/logros')
}

export async function deleteAchievementAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  if (!id) return

  const { count } = await supabase
    .from('user_achievements')
    .select('id', { count: 'exact', head: true })
    .eq('achievement_id', id)

  if ((count ?? 0) > 0) {
    throw new Error(`No se puede eliminar: ${count} usuario${count === 1 ? '' : 's'} desbloquearon este logro.`)
  }

  await supabase.from('achievements').delete().eq('id', id)
  revalidatePath('/admin/logros')
}

export async function createRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const name = slugify(text(formData, 'name'))
  const label = text(formData, 'label')
  const description = text(formData, 'description') || null
  const color = text(formData, 'color') || 'var(--spore)'
  if (!name || !label || isValidRole(name)) return
  await supabase.from('custom_roles').insert({ name, label, description, color })
  revalidatePath('/admin/roles')
  redirect('/admin/roles')
}

export async function updateRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const label = text(formData, 'label')
  const description = text(formData, 'description') || null
  const color = text(formData, 'color') || 'var(--spore)'
  if (!id || !label) return
  await supabase.from('custom_roles').update({ label, description, color }).eq('id', id)
  revalidatePath('/admin/roles')
  redirect('/admin/roles')
}

export async function deleteRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const name = text(formData, 'name')
  if (!id || !name || isValidRole(name)) return
  await supabase.from('users').update({ role: 'reader', updated_at: new Date().toISOString() }).eq('role', name)
  await supabase.from('custom_roles').delete().eq('id', id)
  revalidatePath('/admin/roles')
}

export async function saveMissionAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const title = text(formData, 'title')
  if (!title) throw new Error('El título es obligatorio')

  const VALID_CRITERIA = ['comment_count', 'reaction_given', 'easter_egg_found', 'entry_published', 'xp_total', 'level_reached', 'streak_days']
  const criteriaType = text(formData, 'criteriaType')
  if (!VALID_CRITERIA.includes(criteriaType)) throw new Error('Tipo de criterio inválido')

  const startsAtRaw = text(formData, 'startsAt')
  const endsAtRaw = text(formData, 'endsAt')

  const patch = {
    title,
    description: text(formData, 'description') || null,
    criteria_type: criteriaType,
    criteria_value: Math.max(1, Number(text(formData, 'criteriaValue')) || 1),
    xp_reward: Math.max(0, Number(text(formData, 'xpReward')) || 25),
    glyph: text(formData, 'glyph') || 'ᛟ',
    starts_at: startsAtRaw ? new Date(startsAtRaw).toISOString() : null,
    ends_at: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
  }

  if (id) {
    await supabase.from('missions').update(patch).eq('id', id)
  } else {
    await supabase.from('missions').insert(patch)
  }

  revalidatePath('/admin/misiones')
  redirect('/admin/misiones')
}

export async function archiveMissionAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  if (!id) return

  const { data: mission } = await supabase
    .from('missions')
    .select('ends_at')
    .eq('id', id)
    .maybeSingle()

  const now = new Date()
  const isAlreadyExpired = mission?.ends_at && new Date(mission.ends_at as string) < now

  if (isAlreadyExpired) {
    await supabase.from('missions').delete().eq('id', id)
  } else {
    await supabase.from('missions').update({ ends_at: now.toISOString() }).eq('id', id)
  }

  revalidatePath('/admin/misiones')
}

export async function deleteMissionAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  if (!id) return

  const { count } = await supabase
    .from('user_missions')
    .select('id', { count: 'exact', head: true })
    .eq('mission_id', id)

  if ((count ?? 0) > 0) {
    throw new Error(`No se puede eliminar: ${count} usuario${count === 1 ? '' : 's'} completaron esta misión. Usa "Archivar" en su lugar.`)
  }

  await supabase.from('missions').delete().eq('id', id)
  revalidatePath('/admin/misiones')
}

export async function bulkUpdateEntriesAction(formData: FormData) {
  const user = await requireAdminUser()
  const supabase = requireSupabase()

  const idsRaw = text(formData, 'ids')
  const field = text(formData, 'field')
  const value = text(formData, 'value')
  const now = new Date().toISOString()

  let ids: string[]
  try {
    ids = JSON.parse(idsRaw)
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) throw new Error()
  } catch {
    throw new Error('IDs inválidos')
  }

  if (field === 'status') {
    const validStatuses = ['draft', 'published', 'archived']
    if (!validStatuses.includes(value)) throw new Error('Estado inválido')

    if (value === 'published') {
      const { data: existing } = await supabase
        .from('entries')
        .select('id,type,status,author_id')
        .in('id', ids)

      const toPublish = (existing ?? []).filter(e => e.status !== 'published')
      await Promise.all(
        toPublish.map(e =>
          awardXP(e.author_id ?? user.id, e.type === 'chronicle' ? 50 : 40, 'entry_published', e.id)
        )
      )
      await supabase.from('entries')
        .update({ status: value, published_at: now, updated_at: now })
        .in('id', ids)
    } else {
      await supabase.from('entries')
        .update({ status: value, published_at: null, updated_at: now })
        .in('id', ids)
    }
  } else if (field === 'type') {
    const validTypes = ['chronicle', 'codex']
    if (!validTypes.includes(value)) throw new Error('Tipo inválido')
    const patch: Record<string, string | null> = { type: value, updated_at: now }
    if (value === 'chronicle') patch.category = null
    await supabase.from('entries').update(patch).in('id', ids)
  } else if (field === 'tag_add' || field === 'tag_remove') {
    const { data: existing } = await supabase
      .from('entries')
      .select('id,tags')
      .in('id', ids)

    for (const entry of existing ?? []) {
      let currentTags: string[] = []
      try {
        const raw = entry.tags
        currentTags = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [])
      } catch { /* ignore */ }

      const newTags = field === 'tag_add'
        ? (currentTags.includes(value) ? currentTags : [...currentTags, value])
        : currentTags.filter(t => t !== value)

      await supabase.from('entries')
        .update({ tags: JSON.stringify(newTags), updated_at: now })
        .eq('id', entry.id)
    }
  } else {
    throw new Error('Campo inválido')
  }

  revalidatePath('/admin/entradas')
  revalidatePath('/cronicas')
  revalidatePath('/codex')
}

export async function bulkUpdateSiteTextsAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()

  const keysRaw = text(formData, 'keys')
  const section = text(formData, 'section')

  let keys: string[]
  try {
    keys = JSON.parse(keysRaw)
    if (!Array.isArray(keys)) throw new Error()
  } catch {
    throw new Error('Keys inválidas')
  }

  const now = new Date().toISOString()
  for (const key of keys) {
    const value = text(formData, key)
    await supabase.from('site_texts')
      .update({ value, updated_at: now })
      .eq('key', key)
  }

  revalidateTag('site-texts')
  const redirectTo = text(formData, 'redirectTo')
  const safeBase = redirectTo?.startsWith('/admin/') ? redirectTo : `/admin/textos?section=${encodeURIComponent(section)}`
  redirect(`${safeBase}${safeBase.includes('?') ? '&' : '?'}saved=1`)
}

export async function restoreSiteTextAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const key = text(formData, 'key')
  const section = text(formData, 'section')
  if (!key) return

  const { data } = await supabase
    .from('site_texts')
    .select('default_value')
    .eq('key', key)
    .maybeSingle()

  if (data?.default_value) {
    await supabase.from('site_texts')
      .update({ value: data.default_value, updated_at: new Date().toISOString() })
      .eq('key', key)
    revalidateTag('site-texts')
  }

  const redirectTo = text(formData, 'redirectTo')
  if (redirectTo?.startsWith('/admin/')) redirect(redirectTo)
  else if (section) redirect(`/admin/textos?section=${encodeURIComponent(section)}`)
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  if (!id) return
  await supabase.from('comments').update({ deleted: true, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/comentarios')
}

export async function sealCommentAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const currentState = formData.get('sealed') === 'true'
  if (!id) return
  await supabase.from('comments').update({ sealed: !currentState, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/comentarios')
}

