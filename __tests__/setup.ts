import { vi } from 'vitest'

// Silenciar console.error en tests para reducir ruido
vi.spyOn(console, 'error').mockImplementation(() => {})

// Variables de entorno mínimas para que Supabase no lance
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000'
