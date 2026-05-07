import { unstable_cache } from 'next/cache'
import { type CommentRow, type EntryRow, mapAchievement, mapEntry, mapUser, requireSupabase, toDate } from '@/lib/supabase/helpers'

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

  return (data ?? []).map(mapAchievement)
}

export async function getAdminMissions() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('missions')
    .select('id,title,description,criteria_type,criteria_value,xp_reward,starts_at,ends_at,created_at')
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    criteriaType: row.criteria_type,
    criteriaValue: row.criteria_value,
    xpReward: row.xp_reward,
    startsAt: toDate(row.starts_at),
    endsAt: toDate(row.ends_at),
    createdAt: toDate(row.created_at),
  }))
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
