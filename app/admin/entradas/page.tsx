import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { Pagination } from '@/components/admin/Pagination'
import { EntriesTable } from '@/components/admin/EntriesTable'
import { getAdminEntries } from '@/lib/supabase/queries/admin'

type Props = { searchParams: Promise<{ type?: string; status?: string; page?: string }> }

const FILTER_TYPES = ['all', 'chronicle', 'codex'] as const
const FILTER_STATUSES = ['all', 'draft', 'published', 'archived'] as const

const TYPE_LABELS: Record<string, string> = { all: 'Todos los tipos', chronicle: 'Crónica', codex: 'Codex' }
const STATUS_LABELS: Record<string, string> = { all: 'Todos los estados', draft: 'Borrador', published: 'Publicada', archived: 'Archivada' }

export default async function AdminEntriesPage({ searchParams }: Props) {
  const { type, status, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const { rows: entries, total, pageSize } = await getAdminEntries({ type, status, page })

  const extraParams: Record<string, string> = {}
  if (type)   extraParams.type   = type
  if (status) extraParams.status = status

  function filterHref(key: 'type' | 'status', value: string) {
    const p = new URLSearchParams({ ...extraParams, [key]: value })
    if (value === 'all') p.delete(key)
    p.delete('page')
    const str = p.toString()
    return `/admin/entradas${str ? `?${str}` : ''}`
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: 0 }}>Entradas</h1>
        <Link href="/admin/entradas/nueva">
          <Btn variant="rune">Nueva entrada</Btn>
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTER_TYPES.map(t => {
          const active = (type ?? 'all') === t
          return (
            <Link key={t} href={filterHref('type', t)} style={{
              padding: '5px 12px',
              border: '1px solid',
              borderColor: active ? 'var(--spore)' : 'var(--border-soft)',
              borderRadius: 'var(--r-sm)',
              background: active ? 'var(--spore)' : 'transparent',
              color: active ? 'var(--moss-900)' : 'var(--text-soft)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              textDecoration: 'none',
              fontWeight: active ? 700 : 400,
            }}>
              {TYPE_LABELS[t]}
            </Link>
          )
        })}
        <span style={{ color: 'var(--border-soft)', margin: '0 4px' }}>|</span>
        {FILTER_STATUSES.map(s => {
          const active = (status ?? 'all') === s
          return (
            <Link key={s} href={filterHref('status', s)} style={{
              padding: '5px 12px',
              border: '1px solid',
              borderColor: active ? 'var(--spore)' : 'var(--border-soft)',
              borderRadius: 'var(--r-sm)',
              background: active ? 'var(--spore)' : 'transparent',
              color: active ? 'var(--moss-900)' : 'var(--text-soft)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              textDecoration: 'none',
              fontWeight: active ? 700 : 400,
            }}>
              {STATUS_LABELS[s]}
            </Link>
          )
        })}
      </div>

      <EntriesTable entries={entries} />

      <Pagination page={page} total={total} pageSize={pageSize} basePath="/admin/entradas" extraParams={extraParams} />
    </div>
  )
}
