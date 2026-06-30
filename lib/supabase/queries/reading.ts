import { requireSupabase, toDate } from '@/lib/supabase/helpers'

export async function markAsRead(userId: string, entryId: string): Promise<{ alreadyRead: boolean }> {
  const supabase = requireSupabase()
  const { data: existing } = await supabase
    .from('read_history')
    .select('id')
    .eq('user_id', userId)
    .eq('entry_id', entryId)
    .maybeSingle()

  if (existing) return { alreadyRead: true }

  const { error } = await supabase.from('read_history').insert({
    user_id: userId,
    entry_id: entryId,
  })
  if (error) throw new Error(error.message)

  return { alreadyRead: false }
}

export async function unmarkAsRead(userId: string, entryId: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('read_history')
    .delete()
    .eq('user_id', userId)
    .eq('entry_id', entryId)
  if (error) throw new Error(error.message)
}

export async function isRead(userId: string, entryId: string): Promise<boolean> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('read_history')
    .select('id')
    .eq('user_id', userId)
    .eq('entry_id', entryId)
    .maybeSingle()
  return !!data
}

export async function getReadEntryIds(userId: string): Promise<Set<string>> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('read_history')
    .select('entry_id')
    .eq('user_id', userId)
  return new Set((data ?? []).map(row => row.entry_id as string))
}

export type ReadHistoryItem = {
  entryId: string
  readAt: Date | null
  entry: {
    slug: string
    title: string
    type: 'chronicle' | 'codex'
  } | null
}

export async function getReadHistory(userId: string, limit = 50): Promise<ReadHistoryItem[]> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('read_history')
    .select('entry_id,read_at,entries(slug,title,type)')
    .eq('user_id', userId)
    .order('read_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map(row => {
    const entry = row.entries as unknown as { slug: string; title: string; type: 'chronicle' | 'codex' } | null
    return {
      entryId: row.entry_id as string,
      readAt: toDate(row.read_at),
      entry: entry ? { slug: entry.slug, title: entry.title, type: entry.type } : null,
    }
  })
}
