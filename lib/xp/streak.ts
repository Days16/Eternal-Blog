import { requireSupabase } from '@/lib/supabase/helpers'
import { XP } from '@/lib/xp/events'

interface StreakRow {
  streak?: number | null
  last_activity_date?: string | null
}

/**
 * Verifica y actualiza la racha diaria del usuario.
 * Retorna { streakBonus: number } — 0 si no hay bonus hoy, DAILY_STREAK si hay racha.
 * Se llama desde awardXP antes de sumar XP de la acción principal.
 */
export async function checkAndUpdateStreak(userId: string): Promise<{ streakBonus: number; newStreak: number }> {
  const supabase = requireSupabase()

  const { data } = await supabase
    .from('users')
    .select('streak, last_activity_date')
    .eq('id', userId)
    .maybeSingle()

  const user = data as StreakRow | null

  if (!user) return { streakBonus: 0, newStreak: 0 }

  const today = new Date().toISOString().slice(0, 10)
  const last = user.last_activity_date ?? null

  if (last === today) {
    return { streakBonus: 0, newStreak: user.streak ?? 0 }
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const newStreak = last === yesterday ? (user.streak ?? 0) + 1 : 1
  const streakBonus = newStreak > 1 ? XP.DAILY_STREAK : 0

  await supabase
    .from('users')
    .update({ streak: newStreak, last_activity_date: today })
    .eq('id', userId)

  return { streakBonus, newStreak }
}
