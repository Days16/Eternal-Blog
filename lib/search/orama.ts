import { tiptapToText } from '@/lib/utils/tiptap'
import { mapEntry, requireSupabase } from '@/lib/supabase/helpers'

export type SearchResult = {
  id: string
  type: 'chronicle' | 'codex'
  title: string
  excerpt: string | null
  slug: string
  category: string | null
  tags: string
  snippet: string
}

function makeSnippet(text: string, query: string) {
  const lower = text.toLowerCase()
  const index = lower.indexOf(query.toLowerCase())
  if (index < 0) return text.slice(0, 180)
  const start = Math.max(0, index - 70)
  return `${start > 0 ? '…' : ''}${text.slice(start, index + query.length + 110)}…`
}

export async function searchEntries(params: { q: string; type?: string; limit?: number }) {
  const q = params.q.trim()
  if (!q) return []
  const type = params.type === 'chronicle' || params.type === 'codex' ? params.type : null
  const supabase = requireSupabase()
  let query = supabase
    .from('entries')
    .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,author_id,created_at,updated_at')
    .eq('status', 'published')
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,tags.ilike.%${q}%,body.ilike.%${q}%`)
    .order('published_at', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(params.limit ?? 20)

  if (type) query = query.eq('type', type)

  const { data } = await query
  const rows = (data ?? []).map(mapEntry)

  return rows.map<SearchResult>(entry => {
    const text = `${entry.excerpt ?? ''} ${tiptapToText(entry.body)}`.trim()
    return { id: entry.id, type: entry.type, title: entry.title, excerpt: entry.excerpt, slug: entry.slug, category: entry.category, tags: entry.tags, snippet: makeSnippet(text || entry.title, q) }
  })
}
