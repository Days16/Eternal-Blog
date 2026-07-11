'use server'

import { getSession } from '@/lib/auth/session'
import { requireSupabase } from '@/lib/supabase/helpers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const AVATAR_BUCKET = 'avatars'
const AVATAR_MAX_BYTES = 2 * 1024 * 1024
const AVATAR_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function updateProfileAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login')

  const name     = String(formData.get('name')     ?? '').trim()
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const bio      = String(formData.get('bio')      ?? '').trim()
  const avatarUrlInput = String(formData.get('avatar_url') ?? '').trim()
  const avatarFile = formData.get('avatar')
  const removeAvatar = formData.get('remove_avatar') === 'on'

  if (!name)     return 'El nombre no puede estar vacío.'
  if (!username) return 'El nombre de iniciado no puede estar vacío.'
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return 'El nombre de iniciado solo puede tener letras, números y guión bajo (3-20 caracteres).'
  if (bio.length > 300) return 'La bio no puede superar los 300 caracteres.'
  if (avatarUrlInput && !avatarUrlInput.startsWith('https://')) return 'La URL del avatar debe ser HTTPS.'

  const supabase = requireSupabase()

  // Subida de archivo: tiene prioridad sobre la URL externa
  let uploadedUrl: string | null = null
  if (!removeAvatar && avatarFile instanceof File && avatarFile.size > 0) {
    const ext = AVATAR_MIME_EXT[avatarFile.type]
    if (!ext) return 'El avatar debe ser JPG, PNG o WebP.'
    if (avatarFile.size > AVATAR_MAX_BYTES) return 'El avatar no puede superar los 2 MB.'

    const path = `${session.user.id}-${Date.now()}.${ext}`
    try {
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, avatarFile, { contentType: avatarFile.type, cacheControl: '3600', upsert: true })
      if (uploadError) throw uploadError
      uploadedUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl

      // Limpieza best-effort de avatares anteriores del usuario
      const { data: previous } = await supabase.storage
        .from(AVATAR_BUCKET)
        .list('', { search: session.user.id })
      const stale = (previous ?? []).map(o => o.name).filter(n => n !== path)
      if (stale.length > 0) await supabase.storage.from(AVATAR_BUCKET).remove(stale)
    } catch (err) {
      console.error('[perfil/editar] avatar upload failed:', err instanceof Error ? err.message : err)
      return 'No se pudo subir la imagen. Inténtalo de nuevo.'
    }
  }

  // Comprobar que el username no lo usa otro usuario
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', session.user.id)
    .maybeSingle()

  if (existing) return 'Ese nombre de iniciado ya está en uso.'

  const update: Record<string, unknown> = {
    name,
    username,
    bio: bio || null,
    updated_at: new Date().toISOString(),
  }
  // Prioridad: quitar > archivo subido > URL externa. Sin cambios → conservar.
  if (removeAvatar) update.avatar_url = null
  else if (uploadedUrl) update.avatar_url = uploadedUrl
  else if (avatarUrlInput && avatarUrlInput !== session.user.avatarUrl) update.avatar_url = avatarUrlInput

  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', session.user.id)

  if (error) return 'No se pudo guardar el perfil. Inténtalo de nuevo.'

  revalidatePath(`/perfil/${username}`)
  revalidatePath('/perfil')
  redirect(`/perfil/${username}`)
}
