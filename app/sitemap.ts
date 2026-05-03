import { requireSupabase, toDate } from '@/lib/supabase/helpers'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
  const supabase = requireSupabase()
  const { data: published } = await supabase
    .from('entries')
    .select('slug,type,updated_at')
    .eq('status', 'published')

  return [
    { url: `${base}/cronicas`, lastModified: new Date() },
    { url: `${base}/codex`, lastModified: new Date() },
    { url: `${base}/sobre`, lastModified: new Date() },
    { url: `${base}/buscar`, lastModified: new Date() },
    ...(published ?? []).map(entry => ({ url: `${base}/${entry.type === 'codex' ? 'codex' : 'cronicas'}/${entry.slug}`, lastModified: toDate(entry.updated_at) ?? new Date() })),
  ]
}
