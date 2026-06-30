'use server'

import { getSession } from '@/lib/auth/session'
import { requireSupabase } from '@/lib/supabase/helpers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfileAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const session = await getSession()
  if (!session?.user?.id) redirect('/login')

  const name     = String(formData.get('name')     ?? '').trim()
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const bio      = String(formData.get('bio')      ?? '').trim()
  const avatarUrl = String(formData.get('avatar_url') ?? '').trim()

  if (!name)     return 'El nombre no puede estar vacío.'
  if (!username) return 'El nombre de iniciado no puede estar vacío.'
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return 'El nombre de iniciado solo puede tener letras, números y guión bajo (3-20 caracteres).'
  if (bio.length > 300) return 'La bio no puede superar los 300 caracteres.'
  if (avatarUrl && !avatarUrl.startsWith('https://')) return 'La URL del avatar debe ser HTTPS.'

  const supabase = requireSupabase()

  // Comprobar que el username no lo usa otro usuario
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', session.user.id)
    .maybeSingle()

  if (existing) return 'Ese nombre de iniciado ya está en uso.'

  const { error } = await supabase
    .from('users')
    .update({
      name,
      username,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id)

  if (error) return 'No se pudo guardar el perfil. Inténtalo de nuevo.'

  revalidatePath(`/perfil/${username}`)
  revalidatePath('/perfil')
  redirect(`/perfil/${username}`)
}
