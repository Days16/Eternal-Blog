import { describe, it, expect, vi } from 'vitest'
import { apiError } from '@/lib/utils/api-error'

describe('apiError', () => {
  it('usa el status indicado', async () => {
    const res = apiError('Algo salió mal', new Error('detalles'), 422)
    expect(res.status).toBe(422)
  })

  it('incluye el mensaje de error en la respuesta', async () => {
    const res = apiError('Mensaje público', null, 500)
    const body = await res.json()
    expect(body.error).toBe('Mensaje público')
  })

  it('oculta details en producción (NODE_ENV=production)', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const res = apiError('Error público', new Error('secreto interno'), 500)
    const body = await res.json()

    expect(body.details).toBeUndefined()

    vi.unstubAllEnvs()
  })
})
