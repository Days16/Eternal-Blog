'use server'

import { auth } from '@/auth'
import { requireSupabase } from '@/lib/supabase/helpers'
import { awardXP } from '@/lib/xp/award'
import { slugify } from '@/lib/utils/slugify'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
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
    if (status === 'published') await awardXP(user.id, type === 'chronicle' ? 50 : 40, 'entry_published', newId)
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
  
  if (!id || !role) return

  try {
    const { error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  } catch (error: any) {
    console.error('[admin] Error actualizando rol:', error)
    const message = error.message || (error instanceof Error ? error.message : 'Error desconocido')
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

export async function createAchievementAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const name = text(formData, 'name')
  if (!name) return
  await supabase.from('achievements').insert({
    slug: slugify(text(formData, 'slug') || name),
    name,
    description: text(formData, 'description') || null,
    color: text(formData, 'color') || 'var(--spore)',
    rune_glyph: text(formData, 'runeGlyph') || 'ᛟ',
    criteria_type: text(formData, 'criteriaType'),
    criteria_value: Number(text(formData, 'criteriaValue')) || 1,
    xp_reward: Number(text(formData, 'xpReward')) || 0,
  })
  revalidatePath('/admin/logros')
}

const SYSTEM_ROLES = ['visitor', 'reader', 'scribe', 'moderator', 'dev', 'admin']

export async function createRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const name = slugify(text(formData, 'name'))
  const label = text(formData, 'label')
  const description = text(formData, 'description') || null
  const color = text(formData, 'color') || 'var(--spore)'
  if (!name || !label || SYSTEM_ROLES.includes(name)) return
  await supabase.from('custom_roles').insert({ name, label, description, color })
  revalidatePath('/admin/usuarios')
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
  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}

export async function deleteRoleAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const name = text(formData, 'name')
  if (!id || !name || SYSTEM_ROLES.includes(name)) return
  await supabase.from('users').update({ role: 'reader', updated_at: new Date().toISOString() }).eq('role', name)
  await supabase.from('custom_roles').delete().eq('id', id)
  revalidatePath('/admin/usuarios')
}

export async function createMissionAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const title = text(formData, 'title')
  if (!title) return
  await supabase.from('missions').insert({
    title,
    description: text(formData, 'description') || null,
    criteria_type: text(formData, 'criteriaType') || 'comment_count',
    criteria_value: Number(text(formData, 'criteriaValue')) || 1,
    xp_reward: Number(text(formData, 'xpReward')) || 25,
    starts_at: text(formData, 'startsAt') ? new Date(text(formData, 'startsAt')).toISOString() : null,
    ends_at: text(formData, 'endsAt') ? new Date(text(formData, 'endsAt')).toISOString() : null,
  })
  revalidatePath('/admin/misiones')
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

