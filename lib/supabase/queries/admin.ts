import { unstable_cache } from 'next/cache'
import { type CommentRow, type EntryRow, mapAchievement, mapEntry, mapUser, requireSupabase, toDate } from '@/lib/supabase/helpers'

export type SiteText = {
  key: string
  value: string
  defaultValue: string
  description: string | null
  section: string
  updatedAt: Date | null
}

async function attachEntryAuthors(rows: EntryRow[]) {
  const supabase = requireSupabase()
  const authorIds = [...new Set(rows.map(row => row.author_id).filter(Boolean))]
  const { data: authors } = authorIds.length
    ? await supabase.from('users').select('id,name,username').in('id', authorIds)
    : { data: [] }
  const byId = new Map((authors ?? []).map(author => [author.id, mapUser(author)]))
  return rows.map(row => ({ ...mapEntry(row), author: byId.get(row.author_id) ?? null }))
}

async function _getAdminDashboard() {
  const supabase = requireSupabase()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    { count: totalEntries },
    { count: totalComments },
    { count: totalUsers },
    { data: xpRows },
    { count: weekComments },
    { count: prevWeekComments },
    { count: weekUsers },
    { count: prevWeekUsers },
    { data: weekXpRows },
    { data: prevWeekXpRows },
    { data: activityRows },
  ] = await Promise.all([
    supabase.from('entries').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('deleted', false),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('activity_log').select('xp_delta'),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('deleted', false).gte('created_at', weekAgo.toISOString()),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('deleted', false).gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', weekAgo.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', weekAgo.toISOString()),
    supabase.from('activity_log').select('xp_delta').gte('created_at', weekAgo.toISOString()),
    supabase.from('activity_log').select('xp_delta').gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', weekAgo.toISOString()),
    supabase.from('activity_log').select('created_at').gte('created_at', twoWeeksAgo.toISOString()).order('created_at', { ascending: true }),
  ])

  const totalXp = (xpRows ?? []).reduce((sum, row) => sum + (row.xp_delta ?? 0), 0)
  const weekXp = (weekXpRows ?? []).reduce((sum, row) => sum + (row.xp_delta ?? 0), 0)
  const prevWeekXp = (prevWeekXpRows ?? []).reduce((sum, row) => sum + (row.xp_delta ?? 0), 0)

  function calcDelta(curr: number, prev: number): number | null {
    if (prev === 0) return null
    return Math.round(((curr - prev) / prev) * 100)
  }

  // Actividad diaria — últimos 14 días
  const dailyCounts: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyCounts[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of activityRows ?? []) {
    const day = (row.created_at as string | null)?.slice(0, 10)
    if (day && day in dailyCounts) dailyCounts[day]++
  }
  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }))

  const { data: entryRows } = await supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(6)

  const recentEntries = await attachEntryAuthors(entryRows ?? [])

  const { data: commentRows } = await supabase
    .from('comments')
    .select('id,user_id,entry_id,body,parent_id,depth,path,sealed,deleted,created_at,updated_at')
    .eq('deleted', false)
    .order('created_at', { ascending: false })
    .limit(4)

  const recentComments = await attachCommentRelations(commentRows ?? [])

  return {
    totalEntries: totalEntries ?? 0,
    totalComments: totalComments ?? 0,
    totalUsers: totalUsers ?? 0,
    totalXp,
    weekComments: weekComments ?? 0,
    weekUsers: weekUsers ?? 0,
    weekXp,
    commentsDelta: calcDelta(weekComments ?? 0, prevWeekComments ?? 0),
    usersDelta: calcDelta(weekUsers ?? 0, prevWeekUsers ?? 0),
    xpDelta: calcDelta(weekXp, prevWeekXp),
    chartData,
    recentEntries,
    recentComments,
  }
}

// Caché de 60 s — el dashboard no necesita ser instantáneo; se invalida con revalidateTag('admin-dashboard')
export const getAdminDashboard = unstable_cache(
  _getAdminDashboard,
  ['admin-dashboard'],
  { revalidate: 60, tags: ['admin-dashboard'] },
)

export async function getAdminEntries(params?: { type?: string; status?: string; page?: number; pageSize?: number }) {
  const supabase = requireSupabase()
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 20))
  const from = (page - 1) * pageSize

  let query = supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (params?.type && params.type !== 'all') query = query.eq('type', params.type)
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status)

  const { data, count } = await query
  const rows = await attachEntryAuthors(data ?? [])
  return { rows, total: count ?? 0, page, pageSize }
}

export async function getEntryForAdmin(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  if (!isUuid) return undefined

  const supabase = requireSupabase()
  const { data } = await supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .eq('id', id)
    .maybeSingle()

  return data ? mapEntry(data) : undefined
}

export async function getAdminComments(params?: { page?: number; pageSize?: number }) {
  const supabase = requireSupabase()
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 25))
  const from = (page - 1) * pageSize

  const { data, count } = await supabase
    .from('comments')
    .select('id,user_id,entry_id,body,parent_id,depth,path,sealed,deleted,created_at,updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  const rows = await attachCommentRelations(data ?? [])
  return { rows, total: count ?? 0, page, pageSize }
}

export async function getAdminUsers(params?: { page?: number; pageSize?: number }) {
  const supabase = requireSupabase()
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params?.pageSize ?? 25))
  const from = (page - 1) * pageSize

  const { data, count } = await supabase
    .from('users')
    .select('id,name,username,email,role,level,xp,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  return { rows: (data ?? []).map(mapUser), total: count ?? 0, page, pageSize }
}

export async function getAdminAchievements() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('achievements')
    .select('id,slug,name,description,rune_glyph,color,criteria_type,criteria_value,xp_reward,created_at')
    .order('name', { ascending: true })

  const mapped = (data ?? []).map(mapAchievement)
  const ids = mapped.map(a => a.id).filter(Boolean)

  const unlockCounts = new Map<string, number>()
  if (ids.length > 0) {
    const { data: unlocks } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .in('achievement_id', ids)
    for (const row of unlocks ?? []) {
      if (row.achievement_id) {
        unlockCounts.set(row.achievement_id, (unlockCounts.get(row.achievement_id) ?? 0) + 1)
      }
    }
  }

  return mapped.map(a => ({ ...a, unlockCount: unlockCounts.get(a.id) ?? 0 }))
}

export async function getAchievementForAdmin(id: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('achievements')
    .select('id,slug,name,description,rune_glyph,color,criteria_type,criteria_value,xp_reward,created_at')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  return { ...mapAchievement(data), unlockCount: 0 }
}

export type MissionStatus = 'active' | 'upcoming' | 'open' | 'expired'

function getMissionStatus(startsAt: Date | null, endsAt: Date | null, now: Date): MissionStatus {
  if (startsAt && startsAt > now) return 'upcoming'
  if (!endsAt) return 'open'
  if (endsAt < now) return 'expired'
  return 'active'
}

export async function getAdminMissions() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('missions')
    .select('id,title,description,criteria_type,criteria_value,xp_reward,glyph,starts_at,ends_at,created_at')
    .order('created_at', { ascending: false })

  const rows = data ?? []
  const ids = rows.map(r => r.id).filter(Boolean) as string[]

  const completionCounts = new Map<string, number>()
  if (ids.length > 0) {
    const { data: completions } = await supabase
      .from('user_missions')
      .select('mission_id')
      .in('mission_id', ids)
    for (const row of completions ?? []) {
      if (row.mission_id) {
        completionCounts.set(row.mission_id, (completionCounts.get(row.mission_id) ?? 0) + 1)
      }
    }
  }

  const now = new Date()
  return rows.map(row => {
    const startsAt = toDate(row.starts_at)
    const endsAt = toDate(row.ends_at)
    return {
      id: String(row.id ?? ''),
      title: row.title as string | null,
      description: row.description as string | null,
      criteriaType: row.criteria_type as string | null,
      criteriaValue: row.criteria_value as number | null,
      xpReward: row.xp_reward as number | null,
      glyph: String(row.glyph ?? 'ᛟ'),
      startsAt,
      endsAt,
      createdAt: toDate(row.created_at),
      status: getMissionStatus(startsAt, endsAt, now),
      completionCount: completionCounts.get(String(row.id ?? '')) ?? 0,
    }
  })
}

export async function getMissionForAdmin(id: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('missions')
    .select('id,title,description,criteria_type,criteria_value,xp_reward,glyph,starts_at,ends_at,created_at')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  return {
    id: String(data.id ?? ''),
    title: data.title as string | null,
    description: data.description as string | null,
    criteriaType: data.criteria_type as string | null,
    criteriaValue: data.criteria_value as number | null,
    xpReward: data.xp_reward as number | null,
    glyph: String(data.glyph ?? 'ᛟ'),
    startsAt: toDate(data.starts_at),
    endsAt: toDate(data.ends_at),
    createdAt: toDate(data.created_at),
  }
}

export async function getCustomRoles() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('custom_roles')
    .select('id,name,label,description,color,created_at')
    .order('created_at', { ascending: true })
  return (data ?? []).map(row => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    label: String(row.label ?? ''),
    description: (row.description as string | null) ?? null,
    color: String(row.color ?? 'var(--spore)'),
  }))
}

export async function getSiteTexts(): Promise<Record<string, SiteText[]>> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('site_texts')
    .select('key,value,default_value,description,section,updated_at')
    .order('section')
    .order('key')

  const result: Record<string, SiteText[]> = {}
  for (const row of data ?? []) {
    const sec: string = row.section ?? 'general'
    if (!result[sec]) result[sec] = []
    result[sec].push({
      key: row.key,
      value: row.value,
      defaultValue: row.default_value,
      description: (row.description as string | null) ?? null,
      section: sec,
      updatedAt: toDate(row.updated_at),
    })
  }
  return result
}

export const getSiteTextsMap = unstable_cache(
  async () => {
    const supabase = requireSupabase()
    const { data } = await supabase.from('site_texts').select('key,value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value
    return map
  },
  ['site-texts-map'],
  { revalidate: 300, tags: ['site-texts'] },
)

async function attachCommentRelations(rows: CommentRow[]) {
  const supabase = requireSupabase()
  const userIds = [...new Set(rows.map(row => row.user_id).filter(Boolean))]
  const entryIds = [...new Set(rows.map(row => row.entry_id).filter(Boolean))]
  const [{ data: authors }, { data: entries }] = await Promise.all([
    userIds.length ? supabase.from('users').select('id,name,username,role').in('id', userIds) : Promise.resolve({ data: [] }),
    entryIds.length ? supabase.from('entries').select('id,title,slug,type').in('id', entryIds) : Promise.resolve({ data: [] }),
  ])
  const authorById = new Map((authors ?? []).map(author => [author.id, mapUser(author)]))
  const entryById = new Map((entries ?? []).map(entry => [entry.id, entry]))

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    entryId: row.entry_id,
    body: row.body,
    parentId: row.parent_id,
    depth: row.depth,
    path: row.path,
    sealed: row.sealed,
    deleted: row.deleted,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
    author: authorById.get(row.user_id) ?? null,
    entry: entryById.get(row.entry_id) ?? null,
  }))
}
