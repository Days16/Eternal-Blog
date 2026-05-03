export const RUNES = ['ᚠ', 'ᚱ', 'ᚦ', 'ᚨ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'] as const

export const LEVELS = [
  { n: 1, name: 'Aprendiz',  color: 'var(--moss-400)',  rune: 'ᚨ' },
  { n: 2, name: 'Iniciado',  color: 'var(--mist)',      rune: 'ᛁ' },
  { n: 3, name: 'Adepto',    color: 'var(--spore)',     rune: 'ᛊ' },
  { n: 4, name: 'Druida',    color: 'var(--rune)',      rune: 'ᛞ' },
  { n: 5, name: 'Archimago', color: 'var(--amethyst)',  rune: 'ᛗ' },
] as const

export type Level = typeof LEVELS[number]
export type LevelNumber = 1 | 2 | 3 | 4 | 5
