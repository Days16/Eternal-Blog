'use server'

import { requireAuth } from '@/lib/auth/session'
import { unmarkAsRead } from '@/lib/supabase/queries/reading'
import { revalidatePath } from 'next/cache'

export async function unmarkReadAction(formData: FormData) {
  const session = await requireAuth()
  const entryId = String(formData.get('entryId') ?? '').trim()
  if (!entryId) return

  await unmarkAsRead(session.user.id, entryId).catch(() => {})
  revalidatePath(`/perfil/${session.user.username || session.user.id}`)
}
