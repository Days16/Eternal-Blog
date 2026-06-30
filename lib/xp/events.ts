export const XP = {
  COMMENT:          10,
  REPLY:             8,
  REACTION_GIVEN:    2,
  FIRST_COMMENT:    20,
  REGISTER:         15,
  DAILY_STREAK:     10,
  FORUM_THREAD:     10,
  FORUM_REPLY:       5,
  FOLLOW_SOMEONE:    1,
  PROFILE_COMPLETE: 25,
  ENTRY_READ:        5,
} as const

export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Aprendiz',  min: 0,     max: 499   as number | null },
  { level: 2, name: 'Iniciado',  min: 500,   max: 1999  as number | null },
  { level: 3, name: 'Adepto',    min: 2000,  max: 4999  as number | null },
  { level: 4, name: 'Druida',    min: 5000,  max: 11999 as number | null },
  { level: 5, name: 'Archimago', min: 12000, max: null },
] as const

export function getLevelForXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) return LEVEL_THRESHOLDS[i].level
  }
  return 1
}

export function getXpProgress(xp: number) {
  const level = getLevelForXp(xp)
  const current = LEVEL_THRESHOLDS[level - 1]
  const next = level < 5 ? LEVEL_THRESHOLDS[level] : null

  if (!next) {
    return { current, next: null, progressPct: 100, xpToNext: null }
  }

  const range = next.min - current.min
  const earned = xp - current.min
  const progressPct = Math.min(100, Math.round((earned / range) * 100))
  const xpToNext = next.min - xp

  return { current, next, progressPct, xpToNext }
}
