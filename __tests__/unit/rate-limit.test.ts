import { describe, it, expect } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  it('permite las primeras N peticiones', () => {
    const key = `test-allow-${Date.now()}`
    for (let i = 0; i < 3; i++) {
      const { limited } = rateLimit(key, 3, 60_000)
      expect(limited).toBe(false)
    }
  })

  it('bloquea la petición N+1', () => {
    const key = `test-block-${Date.now()}`
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000)
    const { limited } = rateLimit(key, 3, 60_000)
    expect(limited).toBe(true)
  })

  it('reinicia el contador tras expirar la ventana', async () => {
    const key = `test-reset-${Date.now()}`
    rateLimit(key, 1, 50)  // ventana de 50ms
    rateLimit(key, 1, 50)  // supera el límite

    await new Promise(r => setTimeout(r, 60))

    const { limited } = rateLimit(key, 1, 50)
    expect(limited).toBe(false)
  })
})
