'use server'

import { auth } from '@/auth'
import { requireSupabase } from '@/lib/supabase/helpers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RoadmapPhase } from '@/lib/supabase/queries/roadmap'

const VALID_PHASES: RoadmapPhase[] = ['done', 'in_progress', 'next', 'future']

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

async function requireAdminUser() {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user?.id || (role !== 'admin' && role !== 'dev')) redirect('/login')
  return session.user
}

function revalidateAll() {
  revalidateTag('roadmap')
  revalidatePath('/horizonte')
  revalidatePath('/admin/roadmap')
}

export async function saveRoadmapItemAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const title = text(formData, 'title')
  if (!title) throw new Error('El título es obligatorio')

  const phase = text(formData, 'phase') as RoadmapPhase
  if (!VALID_PHASES.includes(phase)) throw new Error('Fase inválida')

  const patch = {
    phase,
    title,
    description: text(formData, 'description') || null,
    version_tag: text(formData, 'version_tag') || null,
    sort_order: Math.max(0, Number(text(formData, 'sort_order')) || 0),
    public: formData.get('public') === 'on',
    updated_at: new Date().toISOString(),
  }

  if (id) {
    await supabase.from('roadmap_items').update(patch).eq('id', id)
  } else {
    await supabase.from('roadmap_items').insert({ ...patch, created_at: new Date().toISOString() })
  }

  revalidateAll()
  redirect('/admin/roadmap')
}

export async function deleteRoadmapItemAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  if (!id) return
  await supabase.from('roadmap_items').delete().eq('id', id)
  revalidateAll()
}

export async function toggleRoadmapItemPublicAction(formData: FormData) {
  await requireAdminUser()
  const supabase = requireSupabase()
  const id = text(formData, 'id')
  const current = formData.get('public') === 'true'
  if (!id) return
  await supabase
    .from('roadmap_items')
    .update({ public: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidateAll()
}
