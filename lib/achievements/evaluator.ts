import { requireSupabase } from '@/lib/supabase/helpers'

export async function evaluateAchievements(userId: string): Promise<string[]> {
  const supabase = requireSupabase()
  const { data: user } = await supabase
    .from('users')
    .select('xp,level')
    .eq('id', userId)
    .maybeSingle()

  if (!user) return []

  const { data: unlocked } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const unlockedIds = new Set((unlocked ?? []).map(u => u.achievement_id))

  const { data: pending } = await supabase
    .from('achievements')
    .select('id,slug,criteria_type,criteria_value,xp_reward')

  const toCheck = (pending ?? []).filter(a => !unlockedIds.has(a.id))
  if (toCheck.length === 0) return []

  const [{ count: commentCount }, { count: reactionCount }, { count: eggCount }, { count: totalEggs }] = await Promise.all([
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('deleted', false),
    supabase.from('reactions').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_easter_eggs').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('easter_eggs').select('id', { count: 'exact', head: true }),
  ])

  const commentsTotal = commentCount ?? 0
  const reactionsTotal = reactionCount ?? 0
  const eggsTotal = eggCount ?? 0
  const allEggsTotal = totalEggs ?? 0

  const newlyUnlocked: string[] = []

  for (const achievement of toCheck) {
    let met = false

    switch (achievement.criteria_type) {
      case 'xp_total':          met = user.xp >= achievement.criteria_value; break
      case 'level_reached':     met = user.level >= achievement.criteria_value; break
      case 'comment_count':     met = commentsTotal >= achievement.criteria_value; break
      case 'reaction_given':    met = reactionsTotal >= achievement.criteria_value; break
      case 'easter_egg_found':  met = eggsTotal >= achievement.criteria_value; break
      case 'easter_egg_all':    met = allEggsTotal > 0 && eggsTotal >= allEggsTotal; break
      case 'entry_published':   break  // only relevant for admin/scribe roles
    }

    if (!met) continue

    // Upsert idempotente: si la fila ya existe (concurrent request), ignoreDuplicates
    // evita el doble desbloqueo. Requiere UNIQUE(user_id, achievement_id) en la tabla.
    const { data: inserted } = await supabase
      .from('user_achievements')
      .upsert(
        { user_id: userId, achievement_id: achievement.id, unlocked_at: new Date().toISOString() },
        { onConflict: 'user_id,achievement_id', ignoreDuplicates: true },
      )
      .select('achievement_id')
      .maybeSingle()

    // Si no se insertó (ya existía), saltamos para no duplicar XP
    if (!inserted) continue

    await supabase.from('activity_log').insert({
      user_id: userId,
      kind: 'achievement_unlocked',
      ref_id: achievement.id,
      xp_delta: achievement.xp_reward,
    })

    if (achievement.xp_reward > 0) {
      // TODO: reemplazar por supabase.rpc('add_xp', { p_user_id: userId, p_delta: xp_reward })
      // para una suma atómica en Postgres y eliminar el read-modify-write residual.
      user.xp += achievement.xp_reward
      await supabase
        .from('users')
        .update({ xp: user.xp, updated_at: new Date().toISOString() })
        .eq('id', userId)
    }

    newlyUnlocked.push(achievement.slug)
  }

  return newlyUnlocked
}
