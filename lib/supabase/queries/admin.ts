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

export async function getAdminDashboard() {
  const supabase = requireSupabase()
  const [{ count: totalEntries }, { count: totalComments }, { count: totalUsers }, { data: xpRows }] = await Promise.all([
    supabase.from('entries').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('deleted', false),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('activity_log').select('xp_delta'),
  ])

  const totalXp = (xpRows ?? []).reduce((sum, row) => sum + (row.xp_delta ?? 0), 0)

  const { data: entryRows } = await supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(6)

  const recentEntries = await attachEntryAuthors(entryRows ?? [])

  const { data: commentRows } = await supabase
    .from('comments')
    .select('id,user_id,entry_id,body,created_at,deleted')
    .order('created_at', { ascending: false })
    .limit(6)

  const recentComments = await attachCommentRelations(commentRows ?? [])

  return { totalEntries: totalEntries ?? 0, totalComments: totalComments ?? 0, totalUsers: totalUsers ?? 0, totalXp, recentEntries, recentComments }
}

export async function getAdminEntries(params?: { type?: string; status?: string }) {
  const supabase = requireSupabase()
  let query = supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .order('updated_at', { ascending: false })

  if (params?.type && params.type !== 'all') query = query.eq('type', params.type)
  if (params?.status && params.status !== 'all') query = query.eq('status', params.status)

  const { data } = await query
  return attachEntryAuthors(data ?? [])
}

export async function getEntryForAdmin(id: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .eq('id', id)
    .maybeSingle()

  return data ? mapEntry(data) : undefined
}

export async function getAdminComments() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('comments')
    .select('id,user_id,entry_id,body,parent_id,depth,path,sealed,deleted,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return attachCommentRelations(data ?? [])
}

export async function getAdminUsers() {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('users')
    .select('id,name,username,email,role,level,xp,created_at')
    .order('created_at', { ascending: false })

  return (data ?? []).map(mapUser)
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
