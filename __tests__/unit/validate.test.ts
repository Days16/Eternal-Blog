import { describe, it, expect } from 'vitest'
import { isUuid, assertUuid } from '@/lib/utils/validate'

describe('isUuid', () => {
  it('acepta un UUID v4 válido', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('rechaza un string vacío', () => {
    expect(isUuid('')).toBe(false)
  })

  it('rechaza un UUID sin guiones', () => {
    expect(isUuid('550e8400e29b41d4a716446655440000')).toBe(false)
  })

  it('rechaza valores no string', () => {
    expect(isUuid(null)).toBe(false)
    expect(isUuid(undefined)).toBe(false)
    expect(isUuid(42)).toBe(false)
  })

  it('rechaza strings con inyección SQL básica', () => {
    expect(isUuid("' OR 1=1--")).toBe(false)
  })
})

describe('assertUuid', () => {
  it('devuelve el mismo UUID si es válido', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    expect(assertUuid(id)).toBe(id)
  })

  it('lanza error si no es UUID', () => {
    expect(() => assertUuid('no-es-uuid', 'entryId')).toThrow('entryId no es un UUID válido')
  })
})
