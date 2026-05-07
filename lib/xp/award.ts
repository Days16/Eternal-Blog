import { evaluateAchievements } from '@/lib/achievements/evaluator'
import { evaluateMissions } from '@/lib/missions/evaluator'
import { requireSupabase } from '@/lib/supabase/helpers'
import { checkAndUpdateStreak } from '@/lib/xp/streak'

type ActivityKind = 'comment' | 'reaction' | 'entry_published' | 'achievement_unlocked' | 'easter_egg_found' | 'mission_completed' | 'daily_streak'

type XpRpcRow = {
  new_xp: number
  new_level: number
  leveled_up: boolean
}

function extractXpRpcRow(result: unknown): XpRpcRow {
  if (!Array.isArray(result)) throw new Error('[xp] RPC add_xp devolvió un resultado inválido')
  const [row] = result
  if (!row || typeof row !== 'object') throw new Error('[xp] RPC add_xp devolvió un resultado vacío')

  const candidate = row as Partial<XpRpcRow>
  if (
    typeof candidate.new_xp !== 'number'
    || typeof candidate.new_level !== 'number'
    || typeof candidate.leveled_up !== 'boolean'
  ) {
    throw new Error('[xp] RPC add_xp devolvió columnas inválidas')
  }

  return {
    new_xp: candidate.new_xp,
    new_level: candidate.new_level,
    leveled_up: candidate.leveled_up,
  }
}

async function addXp(userId: string, amount: number) {
  const supabase = requireSupabase()
  const { data, error } = await supabase.rpc('add_xp', { p_user_id: userId, p_delta: amount })
  if (error) throw new Error(`[xp] RPC add_xp falló: ${error.message}`)
  return extractXpRpcRow(data)
}

export async function awardXP(
  userId: string,
  amount: number,
  kind: ActivityKind,
  refId?: string,
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const supabase = requireSupabase()
  const { streakBonus } = await checkAndUpdateStreak(userId)

  let streakResult: XpRpcRow | null = null
  if (streakBonus > 0) {
    streakResult = await addXp(userId, streakBonus)
    await supabase.from('activity_log').insert({
      user_id: userId,
      kind: 'daily_streak',
      ref_id: null,
      xp_delta: streakBonus,
    })
  }

  if (amount === 0) {
    if (streakResult) {
      return {
        newXp: streakResult.new_xp,
        newLevel: streakResult.new_level,
        leveledUp: streakResult.leveled_up,
      }
    }

    const { data: user } = await supabase
      .from('users')
      .select('xp,level')
      .eq('id', userId)
      .maybeSingle()

    return { newXp: user?.xp ?? 0, newLevel: user?.level ?? 1, leveledUp: false }
  }

  const result = await addXp(userId, amount)
  const { new_xp: newXp, new_level: newLevel, leveled_up: leveledUp } = result

  await supabase.from('activity_log').insert({
    user_id: userId,
    kind,
    ref_id: refId ?? null,
    xp_delta: amount,
  })

  if (kind !== 'achievement_unlocked' && kind !== 'mission_completed') {
    try {
      await evaluateMissions(userId)
    } catch (error) {
      console.error('[xp] Error evaluando misiones tras otorgar XP:', error)
    }

    try {
      await evaluateAchievements(userId)
    } catch (error) {
      console.error('[xp] Error evaluando logros tras otorgar XP:', error)
    }
  }

  return { newXp, newLevel, leveledUp }
}
