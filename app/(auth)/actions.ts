'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

async function resolveIp(): Promise<string> {
  try {
    const h = await headers()
    return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' })
}

export async function loginAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const email       = String(formData.get('email') ?? '').trim().toLowerCase()
  const password    = String(formData.get('password') ?? '')
  const callbackUrl = String(formData.get('callbackUrl') ?? '/')

  if (!email || !password) return 'Rellena todos los campos.'

  const ip = await resolveIp()
  const { limited } = rateLimit(`login:${ip}`, 10, 60_000)  // 10 intentos / minuto
  if (limited) return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'

  try {
    await signIn('credentials', { email, password, redirectTo: callbackUrl })
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

  const ip = await resolveIp()
  const { limited } = rateLimit(`register:${ip}`, 3, 3_600_000)  // 3 registros / hora por IP
  if (limited) return 'Demasiados intentos de registro. Espera una hora e inténtalo de nuevo.'

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return 'El nombre debe tener 3-20 caracteres (letras, números y guión bajo).'
  }
  if (password.length < 8) {
    return 'La palabra-llave debe tener al menos 8 caracteres.'
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return 'Faltan las variables de Supabase.'

  const [{ data: byEmail }, { data: byUsername }] = await Promise.all([
    supabase.from('users').select('id').eq('email', email).maybeSingle(),
    supabase.from('users').select('id').eq('username', username).maybeSingle(),
  ])

  if (byEmail || byUsername) return 'Ya existe una cuenta con ese correo o nombre de iniciado.'

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, name: username },
  })
  if (error) {
    if (error.message.includes('rate limit') || error.status === 429) {
      return 'Demasiados intentos de registro. Espera unos minutos e inténtalo de nuevo.'
    }
    return error.message
  }

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
