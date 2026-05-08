import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:  z.string().url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY es obligatoria'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es obligatoria'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET debe tener al menos 32 caracteres'),
  NEXTAUTH_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_AUTHOR_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_WORD_GOAL: z.coerce.number().int().positive().optional(),
})

function validate() {
  const result = schema.safeParse(process.env)
  if (!result.success) {
    const msgs = result.error.issues.map(i => `  • ${i.path.join('.')}: ${i.message}`)
    throw new Error(`Variables de entorno inválidas:\n${msgs.join('\n')}`)
  }
  return result.data
}

// Se evalúa una vez al arrancar el servidor
export const env = validate()
