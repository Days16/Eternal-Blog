import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const AUTH_OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } } as const

// Cliente con service role para operaciones de DB (bypassa RLS).
export function getSupabaseServerClient() {
  const key = supabaseServiceRoleKey || supabaseAnonKey
  if (!supabaseUrl || !key) return null
  return createClient(supabaseUrl, key, AUTH_OPTIONS)
}

// Cliente con anon key exclusivamente para auth.signInWithPassword.
// El endpoint /auth/v1/token rechaza la service role key con 400 invalid_credentials.
export function getSupabaseAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, AUTH_OPTIONS)
}
