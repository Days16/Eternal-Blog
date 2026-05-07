import { requireSupabase } from '@/lib/supabase/helpers'
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

  // RPC atómica: usa FOR UPDATE en Postgres para evitar condición de carrera
  // Requiere ejecutar supabase/migrations/001_add_xp_rpc.sql en el dashboard
  const { data: result, error: rpcError } = await supabase
    .rpc('add_xp', { p_user_id: userId, p_delta: amount })

  if (rpcError) throw new Error(`[xp] RPC add_xp falló: ${rpcError.message}`)

  const row = (result as Array<{ new_xp: number; new_level: number; leveled_up: boolean }>)[0]
  const { new_xp: newXp, new_level: newLevel, leveled_up: leveledUp } = row

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
