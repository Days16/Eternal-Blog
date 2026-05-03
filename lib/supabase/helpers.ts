import { getSupabaseServerClient } from './server'

export function requireSupabase() {
  const supabase = getSupabaseServerClient()
  if (!supabase) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return supabase
}

export function toDate(value: unknown) {
  return typeof value === 'string' || value instanceof Date ? new Date(value) : null
}

export function mapUser(row: any) {
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

export function mapEntry(row: any) {
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

export function mapAchievement(row: any) {
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

export function mapActivity(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    refId: row.ref_id,
    xpDelta: row.xp_delta ?? 0,
    createdAt: toDate(row.created_at),
  }
}
