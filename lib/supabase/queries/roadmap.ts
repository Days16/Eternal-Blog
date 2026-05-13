import { unstable_cache } from 'next/cache'
import { requireSupabase } from '@/lib/supabase/helpers'

export type RoadmapPhase = 'done' | 'in_progress' | 'next' | 'future'

export interface RoadmapItem {
  id: string
  phase: RoadmapPhase
  title: string
  description: string | null
  versionTag: string | null
  sortOrder: number
  public: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

function mapItem(row: Record<string, unknown>): RoadmapItem {
  return {
    id: String(row.id ?? ''),
    phase: (row.phase as RoadmapPhase) ?? 'future',
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    versionTag: (row.version_tag as string | null) ?? null,
    sortOrder: Number(row.sort_order ?? 0),
    public: Boolean(row.public ?? true),
    createdAt: row.created_at ? new Date(row.created_at as string) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
  }
}

async function _getPublicRoadmap(): Promise<Record<RoadmapPhase, RoadmapItem[]>> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('roadmap_items')
    .select('id,phase,title,description,version_tag,sort_order,public,created_at,updated_at')
    .eq('public', true)
    .order('sort_order', { ascending: true })

  const result: Record<RoadmapPhase, RoadmapItem[]> = {
    done: [],
    in_progress: [],
    next: [],
    future: [],
  }

  for (const row of data ?? []) {
    const item = mapItem(row as Record<string, unknown>)
    if (item.phase in result) result[item.phase].push(item)
  }

  return result
}

export const getPublicRoadmap = unstable_cache(
  _getPublicRoadmap,
  ['public-roadmap'],
  { revalidate: 3600, tags: ['roadmap'] },
)

export async function getAdminRoadmap(): Promise<RoadmapItem[]> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('roadmap_items')
    .select('id,phase,title,description,version_tag,sort_order,public,created_at,updated_at')
    .order('phase', { ascending: true })
    .order('sort_order', { ascending: true })

  return (data ?? []).map(row => mapItem(row as Record<string, unknown>))
}

export async function getRoadmapItemForAdmin(id: string): Promise<RoadmapItem | null> {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('roadmap_items')
    .select('id,phase,title,description,version_tag,sort_order,public,created_at,updated_at')
    .eq('id', id)
    .maybeSingle()

  return data ? mapItem(data as Record<string, unknown>) : null
}
