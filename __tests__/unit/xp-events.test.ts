import { describe, expect, it } from 'vitest'
import { getLevelForXp, getXpProgress } from '@/lib/xp/events'

describe('getLevelForXp', () => {
  it('resuelve correctamente los umbrales y bordes', () => {
    expect(getLevelForXp(0)).toBe(1)
    expect(getLevelForXp(499)).toBe(1)
    expect(getLevelForXp(500)).toBe(2)
    expect(getLevelForXp(1999)).toBe(2)
    expect(getLevelForXp(2000)).toBe(3)
    expect(getLevelForXp(4999)).toBe(3)
    expect(getLevelForXp(5000)).toBe(4)
    expect(getLevelForXp(11999)).toBe(4)
    expect(getLevelForXp(12000)).toBe(5)
    expect(getLevelForXp(50000)).toBe(5)
  })
})

describe('getXpProgress', () => {
  it('calcula el porcentaje correcto dentro del nivel actual', () => {
    const progress = getXpProgress(1250)

    expect(progress.current.level).toBe(2)
    expect(progress.next?.level).toBe(3)
    expect(progress.progressPct).toBe(50)
    expect(progress.xpToNext).toBe(750)
  })

  it('maneja correctamente el borde al subir de nivel', () => {
    const progress = getXpProgress(5000)

    expect(progress.current.level).toBe(4)
    expect(progress.next?.level).toBe(5)
    expect(progress.progressPct).toBe(0)
    expect(progress.xpToNext).toBe(7000)
  })

  it('retorna 100% en el nivel máximo', () => {
    const progress = getXpProgress(12000)

    expect(progress.current.level).toBe(5)
    expect(progress.next).toBeNull()
    expect(progress.progressPct).toBe(100)
    expect(progress.xpToNext).toBeNull()
  })
})
