const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function assertUuid(value: unknown, label = 'id'): string {
  if (!isUuid(value)) throw new Error(`${label} no es un UUID válido`)
  return value
}
