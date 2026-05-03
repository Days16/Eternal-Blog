import { unstable_cache } from 'next/cache'
import { mapEntry, mapUser, requireSupabase } from '@/lib/supabase/helpers'

export type EntryWithAuthor = Awaited<ReturnType<typeof getEntryBySlug>>

async function attachAuthors(rows: any[]) {
  const supabase = requireSupabase()
  const authorIds = [...new Set(rows.map(row => row.author_id).filter(Boolean))]
  if (authorIds.length === 0) return rows.map(row => ({ ...mapEntry(row), author: null }))

  const { data: authors } = await supabase
    .from('users')
    .select('id,name,username,level,special_role')
    .in('id', authorIds)

  const byId = new Map((authors ?? []).map(author => [author.id, mapUser(author)]))
  return rows.map(row => ({ ...mapEntry(row), author: byId.get(row.author_id) ?? null }))
}

export async function getPublishedChronicles(params?: { page?: number; tag?: string }) {
  const page = params?.page ?? 1
  const limit = 10
  const offset = (page - 1) * limit

  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      let query = supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('type', 'chronicle')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (params?.tag) query = query.ilike('tags', `%"${params.tag}"%`)

      const { data } = await query
      return attachAuthors(data ?? [])
    },
    ['published-chronicles', String(page), params?.tag ?? 'all'],
    { revalidate: 60 },
  )().catch(() => [])
}

export async function getEntryBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (!data) return undefined
      const [entry] = await attachAuthors([data])
      return entry
    },
    ['entry-by-slug', slug],
    { revalidate: 60 },
  )().catch(() => undefined)
}

export async function getAllPublishedSlugs(type: 'chronicle' | 'codex') {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('entries')
    .select('slug')
    .eq('type', type)
    .eq('status', 'published')

  return (data ?? []).map(row => row.slug)
    .filter(Boolean)
}

// ── Codex ────────────────────���────────────────────────────

export const CODEX_CATEGORIES = [
  { id: 'geography',  name: 'Geografía',   rune: 'ᛟ', color: 'var(--moss-300)', desc: 'Mapas, regiones, lugares' },
  { id: 'characters', name: 'Personajes',  rune: 'ᛗ', color: 'var(--rune)',     desc: 'Protagonistas, secundarios, mencionados' },
  { id: 'bestiary',   name: 'Bestiario',   rune: 'ᛇ', color: 'var(--mist)',     desc: 'Criaturas del bosque y más allá' },
  { id: 'spells',     name: 'Hechizos',    rune: 'ᛉ', color: 'var(--spore)',    desc: 'Sistema mágico, runas, rituales' },
  { id: 'timeline',   name: 'Cronología',  rune: 'ᚦ', color: 'var(--amethyst)', desc: 'Eras, eventos, líneas de tiempo' },
  { id: 'glossary',   name: 'Glosario',    rune: 'ᚱ', color: 'var(--ember)',    desc: 'Términos del mundo, idiomas' },
] as const

export async function getCodexStats() {
  const all = await unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('category')
        .eq('type', 'codex')
        .eq('status', 'published')

      return data ?? []
    },
    ['codex-stats'],
    { revalidate: 60 },
  )().catch(() => [])
  const counts: Record<string, number> = {}
  for (const e of all) {
    const cat = e.category ?? 'uncategorized'
    counts[cat] = (counts[cat] ?? 0) + 1
  }
  return counts
}

export async function getCodexFeatured(limit = 3) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('type', 'codex')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(limit)

      return (data ?? []).map(mapEntry)
    },
    ['codex-featured', String(limit)],
    { revalidate: 60 },
  )().catch(() => [])
}

export async function getCodexArticle(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('slug', slug)
        .eq('type', 'codex')
        .eq('status', 'published')
        .maybeSingle()

      if (!data) return undefined
      const [entry] = await attachAuthors([data])
      return entry
    },
    ['codex-article', slug],
    { revalidate: 60 },
  )().catch(() => undefined)
}

export async function getRelatedCodexEntries(entryId: string, category: string | null, limit = 3) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      let query = supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('type', 'codex')
        .eq('status', 'published')
        .neq('id', entryId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (category) query = query.eq('category', category)

      const { data } = await query
      return (data ?? []).map(mapEntry)
    },
    ['related-codex', entryId, category ?? 'none', String(limit)],
    { revalidate: 60 },
  )().catch(() => [])
}

// ── Stats del autor para sidebar ─────────────────────────

export async function getAuthorWordCount(authorId: string) {
  const published = await unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('word_count')
        .eq('author_id', authorId)
        .eq('status', 'published')

      return data ?? []
    },
    ['author-word-count', authorId],
    { revalidate: 300 },
  )().catch(() => [])
  return published.reduce((sum, e) => sum + (e.word_count ?? 0), 0)
}

// ── RSS ─────────────────────────────���────────────────────

export async function getRssChronicles(limit = 20) {
  return unstable_cache(
    async () => {
      const supabase = requireSupabase()
      const { data } = await supabase
        .from('entries')
        .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
        .eq('type', 'chronicle')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      return attachAuthors(data ?? [])
    },
    ['rss-chronicles', String(limit)],
    { revalidate: 300 },
  )().catch(() => [])
}
