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

export async function repairUserProfile(
  userId: string,
  fields: { username?: string; name?: string; email?: string },
) {
  if (!userId || !Object.keys(fields).length) return
  const supabase = requireSupabase()
  const patch: Record<string, string> = {}
  if (fields.username) patch.username = fields.username
  if (fields.name)     patch.name     = fields.name
  if (fields.email)    patch.email    = fields.email
  await supabase.from('users').update(patch).eq('id', userId)
}

export async function getUserProfile(username: string) {
  const value = username.trim()
  if (!value) return undefined

  const supabase = requireSupabase()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  let query = supabase
    .from('users')
    .select('id,name,username,email,bio,avatar_url,role,special_role,level,xp,created_at')

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
    supabase.from('achievements').select('id,slug,name,description,rune_glyph,color,criteria_type,criteria_value,xp_reward,has_name_badge,badge_icon,created_at'),
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
      return (a.name ?? '').localeCompare(b.name ?? '')
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

export async function setActiveBadge(userId: string, achievementId: string | null) {
  const supabase = requireSupabase()

  if (achievementId !== null) {
    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle()
    if (!unlocked) throw new Error('Este logro no está desbloqueado para el usuario.')

    const { data: achievement } = await supabase
      .from('achievements')
      .select('has_name_badge')
      .eq('id', achievementId)
      .maybeSingle()
    if (!achievement?.has_name_badge) throw new Error('Este logro no tiene badge de nombre.')
  }

  const { error } = await supabase
    .from('users')
    .update({ active_badge_achievement_id: achievementId })
    .eq('id', userId)

  if (error) throw error
}

export async function getUserFeaturedEntries(userId: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('user_featured_entries')
    .select('position, entries!inner(id,slug,title,excerpt,cover_url,published_at,type)')
    .eq('user_id', userId)
    .order('position', { ascending: true })

  return (data ?? []).map(row => {
    const e = row.entries as unknown as {
      id: string; slug: string; title: string; excerpt: string | null;
      cover_url: string | null; published_at: string | null; type: string;
    }
    return {
      position: row.position,
      id: e.id,
      slug: e.slug,
      title: e.title,
      excerpt: e.excerpt ?? null,
      coverUrl: e.cover_url ?? null,
      publishedAt: e.published_at ? new Date(e.published_at) : null,
      type: e.type as 'chronicle' | 'codex',
    }
  })
}

export async function upsertFeaturedEntry(userId: string, entryId: string, position: number) {
  if (position < 1 || position > 3) throw new Error('La posición debe ser 1, 2 o 3.')
  const supabase = requireSupabase()

  const { count } = await supabase
    .from('user_featured_entries')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) >= 3) {
    const { data: existing } = await supabase
      .from('user_featured_entries')
      .select('position')
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .maybeSingle()
    if (!existing) throw new Error('Ya tienes 3 artículos destacados. Elimina uno antes de añadir otro.')
  }

  const { error } = await supabase
    .from('user_featured_entries')
    .upsert({ user_id: userId, entry_id: entryId, position }, { onConflict: 'user_id,position' })

  if (error) throw error
}

export async function removeFeaturedEntry(userId: string, position: number) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('user_featured_entries')
    .delete()
    .eq('user_id', userId)
    .eq('position', position)

  if (error) throw error
}

export async function getUserActiveBadge(userId: string) {
  const supabase = requireSupabase()
  const { data: user } = await supabase
    .from('users')
    .select('active_badge_achievement_id')
    .eq('id', userId)
    .maybeSingle()

  if (!user?.active_badge_achievement_id) return null

  const { data: achievement } = await supabase
    .from('achievements')
    .select('id,slug,name,badge_icon,has_name_badge')
    .eq('id', user.active_badge_achievement_id)
    .maybeSingle()

  return achievement ?? null
}
