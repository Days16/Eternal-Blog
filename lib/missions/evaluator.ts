import { requireSupabase } from '@/lib/supabase/helpers'

type SupabaseClientInstance = ReturnType<typeof requireSupabase>
export type MissionCriteriaType = 'comment_count' | 'reaction_given' | 'easter_egg_found' | 'entry_published' | 'xp_total' | 'level_reached' | 'streak_days'

interface MissionRow {
  id?: string | null
  title?: string | null
  description?: string | null
  criteria_type?: string | null
  criteria_value?: number | null
  xp_reward?: number | null
  glyph?: string | null
  starts_at?: string | null
  ends_at?: string | null
  created_at?: string | null
}

interface MissionCompletionRow {
  mission_id?: string | null
}

interface UserSnapshot {
  xp: number
  level: number
  streak: number
  commentCount: number
  reactionCount: number
  easterEggCount: number
  entryPublishedCount: number
}

export interface Mission {
  id: string
  title: string
  description: string | null
  criteriaType: string
  criteriaValue: number
  xpReward: number
  glyph: string
  startsAt: string | null
  endsAt: string | null
  currentValue: number
  progressPct: number
}

export interface UpcomingMission {
  id: string
  title: string
  description: string | null
  criteriaType: string
  criteriaValue: number
  xpReward: number
  glyph: string
  startsAt: string
  endsAt: string | null
}

function getMissionCurrentValue(criteriaType: string, snapshot: UserSnapshot): number {
  switch (criteriaType as MissionCriteriaType) {
    case 'comment_count':
      return snapshot.commentCount
    case 'reaction_given':
      return snapshot.reactionCount
    case 'easter_egg_found':
      return snapshot.easterEggCount
    case 'entry_published':
      return snapshot.entryPublishedCount
    case 'xp_total':
      return snapshot.xp
    case 'level_reached':
      return snapshot.level
    case 'streak_days':
      return snapshot.streak
    default:
      return 0
  }
}

function mapMission(row: MissionRow, snapshot: UserSnapshot): Mission {
  const criteriaType = row.criteria_type ?? 'comment_count'
  const criteriaValue = Math.max(1, row.criteria_value ?? 1)
  const currentValue = getMissionCurrentValue(criteriaType, snapshot)

  return {
    id: row.id ?? '',
    title: row.title ?? 'Misión sin título',
    description: row.description ?? null,
    criteriaType,
    criteriaValue,
    xpReward: row.xp_reward ?? 0,
    glyph: row.glyph ?? 'ᛟ',
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    currentValue,
    progressPct: Math.min(100, Math.round((Math.min(currentValue, criteriaValue) / criteriaValue) * 100)),
  }
}

async function getUpcomingMissionRows(supabase: SupabaseClientInstance): Promise<MissionRow[]> {
  const now = new Date().toISOString()
  const select = 'id,title,description,criteria_type,criteria_value,xp_reward,glyph,starts_at,ends_at,created_at'

  const { data } = await supabase
    .from('missions')
    .select(select)
    .gt('starts_at', now)
    .order('starts_at', { ascending: true })
    .limit(3)

  return (data ?? []) as MissionRow[]
}

async function getActiveMissionRows(supabase: SupabaseClientInstance): Promise<MissionRow[]> {
  const now = new Date().toISOString()
  const select = 'id,title,description,criteria_type,criteria_value,xp_reward,glyph,starts_at,ends_at,created_at'

  const [{ data: bounded }, { data: openEnded }] = await Promise.all([
    supabase
      .from('missions')
      .select(select)
      .lte('starts_at', now)
      .gte('ends_at', now),
    supabase
      .from('missions')
      .select(select)
      .lte('starts_at', now)
      .is('ends_at', null),
  ])

  const byId = new Map<string, MissionRow>()
  for (const row of [...(bounded ?? []), ...(openEnded ?? [])] as MissionRow[]) {
    if (!row.id) continue
    byId.set(row.id, row)
  }

  return [...byId.values()].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
}

async function getCompletedMissionIds(supabase: SupabaseClientInstance, userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('user_missions')
    .select('mission_id')
    .eq('user_id', userId)

  return (data ?? []).flatMap((row: MissionCompletionRow) => (row.mission_id ? [row.mission_id] : []))
}

async function getUserSnapshot(supabase: SupabaseClientInstance, userId: string): Promise<UserSnapshot | null> {
  const [
    { data: user },
    { count: commentCount },
    { count: reactionCount },
    { count: easterEggCount },
    { count: entryPublishedCount },
  ] = await Promise.all([
    supabase.from('users').select('xp,level,streak').eq('id', userId).maybeSingle(),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('deleted', false),
    supabase.from('reactions').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_easter_eggs').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('entries').select('id', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'published'),
  ])

  if (!user) return null

  return {
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    streak: (user as unknown as { streak?: number }).streak ?? 0,
    commentCount: commentCount ?? 0,
    reactionCount: reactionCount ?? 0,
    easterEggCount: easterEggCount ?? 0,
    entryPublishedCount: entryPublishedCount ?? 0,
  }
}

export async function getUserMissionState(userId: string): Promise<{ active: Mission[]; completed: string[]; upcoming: UpcomingMission[] }> {
  const supabase = requireSupabase()
  const [activeRows, upcomingRows, completed, snapshot] = await Promise.all([
    getActiveMissionRows(supabase),
    getUpcomingMissionRows(supabase),
    getCompletedMissionIds(supabase, userId),
    getUserSnapshot(supabase, userId),
  ])

  const upcoming: UpcomingMission[] = upcomingRows
    .filter(row => row.id && row.starts_at)
    .map(row => ({
      id: row.id!,
      title: row.title ?? 'Misión sin título',
      description: row.description ?? null,
      criteriaType: row.criteria_type ?? 'comment_count',
      criteriaValue: Math.max(1, row.criteria_value ?? 1),
      xpReward: row.xp_reward ?? 0,
      glyph: row.glyph ?? 'ᛟ',
      startsAt: row.starts_at!,
      endsAt: row.ends_at ?? null,
    }))

  if (!snapshot) return { active: [], completed, upcoming }

  return {
    active: activeRows.map(row => mapMission(row, snapshot)),
    completed,
    upcoming,
  }
}

export async function evaluateMissions(userId: string): Promise<string[]> {
  const supabase = requireSupabase()
  const [activeRows, completedIds, snapshot] = await Promise.all([
    getActiveMissionRows(supabase),
    getCompletedMissionIds(supabase, userId),
    getUserSnapshot(supabase, userId),
  ])

  if (!snapshot) return []

  const completed = new Set(completedIds)
  const pending = activeRows
    .map(row => mapMission(row, snapshot))
    .filter(mission => mission.id && !completed.has(mission.id))

  if (pending.length === 0) return []

  const newlyCompleted: string[] = []

  for (const mission of pending) {
    if (mission.currentValue < mission.criteriaValue) continue

    const { data } = await supabase
      .from('user_missions')
      .upsert(
        {
          user_id: userId,
          mission_id: mission.id,
          completed_at: new Date().toISOString(),
          xp_awarded: mission.xpReward,
        },
        { onConflict: 'user_id,mission_id', ignoreDuplicates: true },
      )
      .select('mission_id')
      .maybeSingle()

    const inserted = data as MissionCompletionRow | null
    if (!inserted?.mission_id) continue

    if (mission.xpReward > 0) {
      const { error } = await supabase.rpc('add_xp', { p_user_id: userId, p_delta: mission.xpReward })
      if (error) throw new Error(`[missions] RPC add_xp falló: ${error.message}`)
    }

    await supabase.from('activity_log').insert({
      user_id: userId,
      kind: 'mission_completed',
      ref_id: mission.id,
      xp_delta: mission.xpReward,
    })

    newlyCompleted.push(mission.title)
  }

  return newlyCompleted
}
