import { unstable_cache } from 'next/cache'
import { requireSupabase } from '@/lib/supabase/helpers'
import { mapUser } from '@/lib/supabase/helpers'

const THREADS_PER_PAGE = 20
const REPLIES_PER_PAGE = 50

export interface ForumCategory {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string
  color: string
  sortOrder: number
  threadCount?: number
}

export interface ForumThread {
  id: string
  slug: string
  title: string
  body: string
  authorId: string
  categoryId: string
  categorySlug?: string
  pinned: boolean
  locked: boolean
  views: number
  replyCount?: number
  lastReplyAt?: Date | null
  createdAt: Date | null
  updatedAt: Date | null
  author?: ReturnType<typeof mapUser> | null
}

export interface ForumReply {
  id: string
  threadId: string
  userId: string
  body: string
  parentId: string | null
  deleted: boolean
  createdAt: Date | null
  updatedAt: Date | null
  author?: ReturnType<typeof mapUser> | null
  replies?: ForumReply[]
}

function mapCategory(row: Record<string, unknown>): ForumCategory {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    description: (row.description as string | null) ?? null,
    icon: String(row.icon ?? '◈'),
    color: String(row.color ?? 'var(--spore)'),
    sortOrder: Number(row.sort_order ?? 0),
    threadCount: typeof row.thread_count === 'number' ? row.thread_count : undefined,
  }
}

function mapThread(row: Record<string, unknown>): ForumThread {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    authorId: String(row.author_id ?? ''),
    categoryId: String(row.category_id ?? ''),
    categorySlug: typeof row.category_slug === 'string' ? row.category_slug : undefined,
    pinned: Boolean(row.pinned ?? false),
    locked: Boolean(row.locked ?? false),
    views: Number(row.views ?? 0),
    replyCount: typeof row.reply_count === 'number' ? row.reply_count : undefined,
    lastReplyAt: row.last_reply_at ? new Date(row.last_reply_at as string) : null,
    createdAt: row.created_at ? new Date(row.created_at as string) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
    author: null,
  }
}

function mapReply(row: Record<string, unknown>): ForumReply {
  return {
    id: String(row.id ?? ''),
    threadId: String(row.thread_id ?? ''),
    userId: String(row.user_id ?? ''),
    body: String(row.body ?? ''),
    parentId: (row.parent_id as string | null) ?? null,
    deleted: Boolean(row.deleted ?? false),
    createdAt: row.created_at ? new Date(row.created_at as string) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
    author: null,
    replies: [],
  }
}

async function _getForumCategories(): Promise<ForumCategory[]> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('forum_categories')
    .select('id,slug,name,description,icon,color,sort_order')
    .order('sort_order', { ascending: true })

  if (!data) return []

  const categories = data.map(row => mapCategory(row as Record<string, unknown>))

  const { data: counts } = await supabase
    .from('forum_threads')
    .select('category_id')

  if (counts) {
    const countMap = new Map<string, number>()
    for (const r of counts) {
      countMap.set(r.category_id, (countMap.get(r.category_id) ?? 0) + 1)
    }
    for (const cat of categories) {
      cat.threadCount = countMap.get(cat.id) ?? 0
    }
  }

  return categories
}

export const getForumCategories = unstable_cache(
  _getForumCategories,
  ['forum-categories'],
  { revalidate: 300, tags: ['forum', 'forum-categories'] },
)

export async function getForumCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('forum_categories')
    .select('id,slug,name,description,icon,color,sort_order')
    .eq('slug', slug)
    .maybeSingle()

  return data ? mapCategory(data as Record<string, unknown>) : null
}

export async function getForumThreads(
  categoryId: string,
  page = 1,
): Promise<{ threads: ForumThread[]; total: number }> {
  const supabase = requireSupabase()
  const from = (page - 1) * THREADS_PER_PAGE
  const to = from + THREADS_PER_PAGE - 1

  const [{ data, count }, { data: replyCounts }] = await Promise.all([
    supabase
      .from('forum_threads')
      .select('id,slug,title,body,author_id,category_id,pinned,locked,views,created_at,updated_at', { count: 'exact' })
      .eq('category_id', categoryId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to),
    supabase
      .from('forum_replies')
      .select('thread_id')
      .eq('deleted', false),
  ])

  const rows = data ?? []

  const replyCountMap = new Map<string, number>()
  for (const r of replyCounts ?? []) {
    replyCountMap.set(r.thread_id, (replyCountMap.get(r.thread_id) ?? 0) + 1)
  }

  const threads = rows.map(row => {
    const t = mapThread(row as Record<string, unknown>)
    t.replyCount = replyCountMap.get(t.id) ?? 0
    return t
  })

  const authorIds = [...new Set(threads.map(t => t.authorId).filter(Boolean))]
  if (authorIds.length) {
    const { data: authors } = await supabase
      .from('users')
      .select('id,name,username,avatar_url,image,role,level')
      .in('id', authorIds)
    const byId = new Map((authors ?? []).map(a => [a.id, mapUser(a)]))
    for (const t of threads) {
      t.author = byId.get(t.authorId) ?? null
    }
  }

  return { threads, total: count ?? 0 }
}

export async function getForumThread(
  categorySlug: string,
  threadSlug: string,
): Promise<(ForumThread & { category: ForumCategory; replies: ForumReply[] }) | null> {
  const supabase = requireSupabase()

  const { data: catRow } = await supabase
    .from('forum_categories')
    .select('id,slug,name,description,icon,color,sort_order')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (!catRow) return null
  const category = mapCategory(catRow as Record<string, unknown>)

  const { data: threadRow } = await supabase
    .from('forum_threads')
    .select('id,slug,title,body,author_id,category_id,pinned,locked,views,created_at,updated_at')
    .eq('slug', threadSlug)
    .eq('category_id', category.id)
    .maybeSingle()

  if (!threadRow) return null
  const thread = mapThread(threadRow as Record<string, unknown>)

  await supabase
    .from('forum_threads')
    .update({ views: thread.views + 1 })
    .eq('id', thread.id)

  const { data: replyRows } = await supabase
    .from('forum_replies')
    .select('id,thread_id,user_id,body,parent_id,deleted,created_at,updated_at')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })
    .limit(REPLIES_PER_PAGE)

  const replies = (replyRows ?? []).map(r => mapReply(r as Record<string, unknown>))

  const authorIds = [
    ...new Set([thread.authorId, ...replies.map(r => r.userId)].filter(Boolean)),
  ]

  if (authorIds.length) {
    const { data: authors } = await supabase
      .from('users')
      .select('id,name,username,avatar_url,image,role,level')
      .in('id', authorIds)
    const byId = new Map((authors ?? []).map(a => [a.id, mapUser(a)]))
    thread.author = byId.get(thread.authorId) ?? null
    for (const r of replies) {
      r.author = byId.get(r.userId) ?? null
    }
  }

  const replyTree = buildReplyTree(replies)

  return { ...thread, category, replies: replyTree }
}

function buildReplyTree(flat: ForumReply[]): ForumReply[] {
  const byId = new Map<string, ForumReply>()
  const roots: ForumReply[] = []
  for (const r of flat) {
    byId.set(r.id, { ...r, replies: [] })
  }
  for (const r of byId.values()) {
    if (r.parentId) {
      const parent = byId.get(r.parentId)
      if (parent) parent.replies!.push(r)
      else roots.push(r)
    } else {
      roots.push(r)
    }
  }
  return roots
}

export async function getAdminForumStats() {
  const supabase = requireSupabase()
  const [{ count: threadCount }, { count: replyCount }, { data: recentThreads }] = await Promise.all([
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
    supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('deleted', false),
    supabase
      .from('forum_threads')
      .select('id,slug,title,category_id,created_at,author_id')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const threadRows = recentThreads ?? []
  const authorIds = [...new Set(threadRows.map(r => r.author_id).filter(Boolean))]
  const catIds = [...new Set(threadRows.map(r => r.category_id).filter(Boolean))]

  const [{ data: authors }, { data: categories }] = await Promise.all([
    authorIds.length
      ? supabase.from('users').select('id,name,username').in('id', authorIds)
      : { data: [] as { id: string; name: string | null; username: string | null }[] },
    catIds.length
      ? supabase.from('forum_categories').select('id,slug,name').in('id', catIds)
      : { data: [] as { id: string; slug: string; name: string }[] },
  ])

  const byAuthor = new Map((authors ?? []).map(a => [a.id, a]))
  const byCat = new Map((categories ?? []).map(c => [c.id, c]))

  return {
    threadCount: threadCount ?? 0,
    replyCount: replyCount ?? 0,
    recentThreads: threadRows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      createdAt: r.created_at ? new Date(r.created_at) : null,
      author: byAuthor.get(r.author_id) ?? null,
      category: byCat.get(r.category_id) ?? null,
    })),
  }
}
