export const EASTER_EGGS = [
  { slug: 'konami', description: 'Código Konami invocado desde cualquier página', xpReward: 30 },
  { slug: 'mushroom-seven', description: 'Click en el hongo del footer siete veces', xpReward: 30 },
  { slug: 'archimago-search', description: 'Buscar la palabra archimago', xpReward: 30 },
] as const

export type EasterEggSlug = typeof EASTER_EGGS[number]['slug']
