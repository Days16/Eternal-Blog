import { requireSupabase } from '@/lib/supabase/helpers'
import { getLevelForXp } from './events'
import { evaluateAchievements } from '@/lib/achievements/evaluator'

type ActivityKind = 'comment' | 'reaction' | 'entry_published' | 'achievement_unlocked' | 'easter_egg_found' | 'mission_completed'

export async function awardXP(
  userId: string,
  amount: number,
  kind: ActivityKind,
  refId?: string,
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const supabase = requireSupabase()
  if (amount === 0) {
    const { data: user } = await supabase
      .from('users')
      .select('xp,level')
      .eq('id', userId)
      .maybeSingle()

    return { newXp: user?.xp ?? 0, newLevel: user?.level ?? 1, leveledUp: false }
  }

  const { data: user } = await supabase
    .from('users')
    .select('xp,level')
    .eq('id', userId)
    .maybeSingle()

  if (!user) throw new Error(`Usuario ${userId} no encontrado`)

  const newXp = user.xp + amount
  const newLevel = getLevelForXp(newXp)
  const leveledUp = newLevel > user.level

  await supabase
    .from('users')
    .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', userId)

  await supabase.from('activity_log').insert({
    user_id: userId,
    kind,
    ref_id: refId ?? null,
    xp_delta: amount,
  })

  // Evitar bucles infinitos: no evaluar logros si el premio ya es por un logro
  if (kind !== 'achievement_unlocked') {
    try {
      await evaluateAchievements(userId)
    } catch (error) {
      console.error('[xp] Error evaluando logros tras otorgar XP:', error)
    }
  }

  return { newXp, newLevel, leveledUp }
}
