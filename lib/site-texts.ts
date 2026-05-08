import { getSiteTextsMap } from '@/lib/supabase/queries/admin'

/**
 * Devuelve el texto personalizable de la UI para una clave dada.
 * Si la clave no existe en BD, devuelve el fallback.
 * Solo para Server Components — en Client Components recibe los textos como props.
 */
export async function t(key: string, fallback: string): Promise<string> {
  const map = await getSiteTextsMap()
  return map[key] ?? fallback
}
