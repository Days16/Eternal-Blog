import { getSupabaseServerClient } from './server'

export function requireSupabase() {
  const supabase = getSupabaseServerClient()
  if (!supabase) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return supabase
}

export function toDate(value: unknown) {
  return typeof value === 'string' || value instanceof Date ? new Date(value) : null
}

export interface UserRow {
  id?: string
  name?: string | null
  email?: string | null
  email_verified?: string | null
  image?: string | null
  password_hash?: string | null
  username?: string | null
  bio?: string | null
  avatar_url?: string | null
  role?: string | null
  special_role?: string | null
  level?: number | null
  xp?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface EntryRow {
  id?: string
  slug?: string | null
  type?: string | null
  title?: string | null
  excerpt?: string | null
  body?: string | null
  cover_url?: string | null
  tags?: string[] | null
  category?: string | null
  status?: string | null
  word_count?: number | null
  published_at?: string | null
  author_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface AchievementRow {
  id?: string
  slug?: string | null
  name?: string | null
  description?: string | null
  rune_glyph?: string | null
  color?: string | null
  criteria_type?: string | null
  criteria_value?: unknown
  xp_reward?: number | null
  created_at?: string | null
}

export interface ActivityRow {
  id?: string
  user_id?: string | null
  kind?: string | null
  ref_id?: string | null
  xp_delta?: number | null
  created_at?: string | null
}

export interface CommentRow {
  id?: string
  user_id?: string | null
  entry_id?: string | null
  body?: string | null
  parent_id?: string | null
  depth?: number | null
  path?: string | null
  sealed?: boolean | null
  deleted?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export function mapUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: toDate(row.email_verified),
    image: row.image,
    passwordHash: row.password_hash,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    role: row.role,
    specialRole: row.special_role,
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  }
}

export function mapEntry(row: EntryRow) {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverUrl: row.cover_url,
    tags: row.tags,
    category: row.category,
    status: row.status,
    wordCount: row.word_count ?? 0,
    publishedAt: toDate(row.published_at),
    authorId: row.author_id,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  }
}

export function mapAchievement(row: AchievementRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    runeGlyph: row.rune_glyph,
    color: row.color,
    criteriaType: row.criteria_type,
    criteriaValue: row.criteria_value,
    xpReward: row.xp_reward ?? 0,
    createdAt: toDate(row.created_at),
  }
}

export function mapActivity(row: ActivityRow) {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    refId: row.ref_id,
    xpDelta: row.xp_delta ?? 0,
    createdAt: toDate(row.created_at),
  }
}
