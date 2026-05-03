'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function loginAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const email    = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return 'Rellena todos los campos.'

  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
  } catch (err) {
    if (err instanceof AuthError) {
      return 'Credenciales incorrectas. Prueba de nuevo.'
    }
    throw err  // propaga el NEXT_REDIRECT
  }
  return null
}

export async function registerAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const email    = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!username || !email || !password) return 'Rellena todos los campos.'

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return 'El nombre debe tener 3-20 caracteres (letras, números y guión bajo).'
  }
  if (password.length < 8) {
    return 'La palabra-llave debe tener al menos 8 caracteres.'
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return 'Faltan las variables de Supabase.'

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle()

  if (existing) return 'Ya existe una cuenta con ese correo o nombre de iniciado.'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, name: username },
    },
  })
  if (error) return error.message

  const userId = data.user?.id
  if (!userId) return 'Cuenta creada, revisa tu correo para confirmar el acceso.'

  const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email,
      username,
      name: username,
      role: 'reader',
      level: 1,
      xp: 15,
    }, { onConflict: 'id' })

  if (profileError) return profileError.message

  try {
    await signIn('credentials', { email, password, redirectTo: '/' })
  } catch (err) {
    if (err instanceof AuthError) {
      return 'Cuenta creada, pero Supabase requiere confirmar el correo antes de entrar.'
    }
    throw err
  }
  return null
}
