import { requireSupabase } from '@/lib/supabase/helpers'

export async function evaluateAchievements(userId: string): Promise<string[]> {
  const supabase = requireSupabase()
  const { data: user } = await supabase
    .from('users')
    .select('xp,level,streak')
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

  const [
    { count: commentCount },
    { count: reactionCount },
    { count: reactionReceivedCount },
    { count: eggCount },
    { count: totalEggs },
    { count: forumThreadCount },
    { count: forumReplyCount },
    { count: followerCount },
    { count: friendCount },
    { data: entryPublishedData },
    { data: userProfileData },
  ] = await Promise.all([
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('deleted', false),
    supabase.from('reactions').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('reactions')
      .select('entries!inner(author_id)', { count: 'exact', head: true })
      .eq('entries.author_id', userId),
    supabase.from('user_easter_eggs').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('easter_eggs').select('id', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('author_id', userId).eq('deleted', false),
    supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('deleted', false),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
    supabase.from('entries').select('id').eq('author_id', userId).eq('status', 'published'),
    supabase.from('users').select('bio,avatar_url,username').eq('id', userId).maybeSingle(),
  ])

  const commentsTotal        = commentCount ?? 0
  const reactionsTotal       = reactionCount ?? 0
  const reactionsReceived    = reactionReceivedCount ?? 0
  const eggsTotal            = eggCount ?? 0
  const allEggsTotal         = totalEggs ?? 0
  const forumThreadsTotal    = forumThreadCount ?? 0
  const forumRepliesTotal    = forumReplyCount ?? 0
  const followersTotal       = followerCount ?? 0
  const friendsTotal         = friendCount ?? 0
  const entriesPublished     = (entryPublishedData ?? []).length
  const profile              = userProfileData ?? null
  const profileComplete      = profile ? (!!profile.bio && !!profile.avatar_url && !!profile.username) : false

  const newlyUnlocked: string[] = []

  for (const achievement of toCheck) {
    let met = false

    switch (achievement.criteria_type) {
      case 'xp_total':             met = user.xp >= achievement.criteria_value; break
      case 'level_reached':        met = user.level >= achievement.criteria_value; break
      case 'comment_count':        met = commentsTotal >= achievement.criteria_value; break
      case 'reaction_given':       met = reactionsTotal >= achievement.criteria_value; break
      case 'reaction_received':    met = reactionsReceived >= achievement.criteria_value; break
      case 'easter_egg_found':     met = eggsTotal >= achievement.criteria_value; break
      case 'easter_egg_all':       met = allEggsTotal > 0 && eggsTotal >= allEggsTotal; break
      case 'entry_published':      met = entriesPublished >= achievement.criteria_value; break
      case 'forum_thread_count':   met = forumThreadsTotal >= achievement.criteria_value; break
      case 'forum_reply_count':    met = forumRepliesTotal >= achievement.criteria_value; break
      case 'streak_days':          met = (user.streak ?? 0) >= achievement.criteria_value; break
      case 'follow_count':         met = followersTotal >= achievement.criteria_value; break
      case 'friend_count':         met = friendsTotal >= achievement.criteria_value; break
      case 'profile_complete':     met = profileComplete && achievement.criteria_value === 1; break
      case 'manual':               break  // solo admin puede otorgar estos logros
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
      // RPC atómica para evitar read-modify-write sobre user.xp
      await supabase.rpc('add_xp', { p_user_id: userId, p_delta: achievement.xp_reward })
    }

    newlyUnlocked.push(achievement.slug)
  }

  return newlyUnlocked
}
