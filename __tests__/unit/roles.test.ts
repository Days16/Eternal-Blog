import { describe, it, expect } from 'vitest'
import { isValidRole, isModeratorOrAbove, SYSTEM_ROLES } from '@/lib/auth/roles'

describe('isValidRole', () => {
  it('acepta todos los roles del sistema', () => {
    for (const role of SYSTEM_ROLES) {
      expect(isValidRole(role)).toBe(true)
    }
  })

  it('rechaza roles inventados', () => {
    expect(isValidRole('superadmin')).toBe(false)
    expect(isValidRole('root')).toBe(false)
    expect(isValidRole('')).toBe(false)
  })

  it('rechaza valores no-string', () => {
    expect(isValidRole(null)).toBe(false)
    expect(isValidRole(undefined)).toBe(false)
    expect(isValidRole(42)).toBe(false)
  })
})

describe('isModeratorOrAbove', () => {
  it('devuelve true para admin, moderator, dev', () => {
    expect(isModeratorOrAbove('admin')).toBe(true)
    expect(isModeratorOrAbove('moderator')).toBe(true)
    expect(isModeratorOrAbove('dev')).toBe(true)
  })

  it('devuelve false para roles inferiores', () => {
    expect(isModeratorOrAbove('reader')).toBe(false)
    expect(isModeratorOrAbove('scribe')).toBe(false)
    expect(isModeratorOrAbove(null)).toBe(false)
    expect(isModeratorOrAbove(undefined)).toBe(false)
  })
})
