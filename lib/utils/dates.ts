const LOCALE = 'es-ES'

export function formatDate(date: Date | number | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateLong(date: Date | number | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function readingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return `${minutes} min`
}

export function relativeTime(date: Date | number | string | null | undefined): string {
  if (!date) return ''
  const now = Date.now()
  const d = new Date(date).getTime()
  const diff = now - d
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1)  return 'ahora mismo'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24)   return `hace ${hours} h`
  if (days < 7)     return `hace ${days} días`
  return formatDate(date)
}

export function formatWords(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}
