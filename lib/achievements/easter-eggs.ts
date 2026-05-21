export const EASTER_EGGS = [
  { slug: 'konami', description: 'Código Konami invocado desde cualquier página', xpReward: 30 },
  { slug: 'mushroom-seven', description: 'Click en el hongo del footer siete veces', xpReward: 30 },
  { slug: 'archimago-search', description: 'Buscar la palabra archimago', xpReward: 30 },
  { slug: 'triple-click-logo', description: 'Triple click en el logo del sitio', xpReward: 15 },
  { slug: 'idle-watcher', description: 'Permanecer inmóvil durante 2 minutos', xpReward: 20 },
  { slug: 'footer-scroll', description: 'Llegar al fondo de la página', xpReward: 10 },
] as const

export type EasterEggSlug = typeof EASTER_EGGS[number]['slug']
