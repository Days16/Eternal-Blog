import { unstable_cache } from 'next/cache'
import { mapAchievement, mapActivity, mapUser, requireSupabase } from '@/lib/supabase/helpers'

export async function getTopReaders(limit = 3) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('users')
        .select('id,name,username,level,xp,special_role')
        .neq('role', 'admin')
        .order('xp', { ascending: false })
        .limit(limit)

      return (data ?? []).map(mapUser)
    },
    ['top-readers', String(limit)],
    { revalidate: 120 },
  )().catch(() => [])
}

export async function getUserProfile(username: string) {
  const value = username.trim()
  if (!value) return undefined

  const supabase = requireSupabase()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  let query = supabase
    .from('users')
    .select('id,name,username,bio,avatar_url,role,special_role,level,xp,created_at')

  query = isUuid ? query.or(`username.ilike.${value},id.eq.${value}`) : query.ilike('username', value)

  const { data } = await query.maybeSingle()

  return data ? mapUser(data) : undefined
}

export async function getUserStats(userId: string) {
  const supabase = requireSupabase()
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('deleted', false)

  return { commentCount: count ?? 0 }
}

export async function getUserAchievements(userId: string) {
  const supabase = requireSupabase()
  const [{ data: allAchievements }, { data: unlockedRows }] = await Promise.all([
    supabase.from('achievements').select('id,slug,name,description,rune_glyph,color,criteria_type,criteria_value,xp_reward,created_at'),
    supabase.from('user_achievements').select('achievement_id,unlocked_at').eq('user_id', userId),
  ])

  const unlocked = new Map((unlockedRows ?? []).map(row => [row.achievement_id, row.unlocked_at]))

  return (allAchievements ?? [])
    .map(row => {
      const achievement = mapAchievement(row)
      const unlockedAt = unlocked.get(achievement.id) ?? null
      return { ...achievement, unlockedAt, unlocked: unlockedAt !== null }
    })
    .sort((a, b) => {
      if (a.unlocked && b.unlocked && a.unlockedAt && b.unlockedAt) {
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      }
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}

export async function getUserActivity(userId: string, limit = 20) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('activity_log')
    .select('id,user_id,kind,ref_id,xp_delta,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map(mapActivity)
}
