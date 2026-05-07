import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { Pagination } from '@/components/admin/Pagination'
import { getAdminEntries } from '@/lib/supabase/queries/admin'
import { formatDate } from '@/lib/utils/dates'

type Props = { searchParams: Promise<{ type?: string; status?: string; page?: string }> }

export default async function AdminEntriesPage({ searchParams }: Props) {
  const { type, status, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const { rows: entries, total, pageSize } = await getAdminEntries({ type, status, page })

  const extraParams: Record<string, string> = {}
  if (type)   extraParams.type   = type
  if (status) extraParams.status = status

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: 0 }}>Entradas</h1>
        <Link href="/admin/entradas/nueva">
          <Btn variant="rune">Nueva entrada</Btn>
        </Link>
      </div>

      <div className="table-scroll" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ minWidth: 520 }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 110px 150px',
            gap: 16,
            padding: '10px 16px',
            background: 'var(--moss-900)',
            borderBottom: '1px solid var(--border-soft)',
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontWeight: 600,
          }}>
            <span>Título</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Actualizado</span>
          </div>

          {entries.map(entry => (
            <Link
              key={entry.id}
              href={`/admin/entradas/${entry.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px 110px 150px',
                gap: 16,
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-soft)',
                color: 'var(--text)',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                transition: 'background 0.1s',
              }}
              className="hover-row"
            >
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {entry.title}
              </span>
              <span style={{ color: 'var(--text-mute)', textTransform: 'capitalize' }}>
                {entry.type}
              </span>
              <span style={{ color: entry.status === 'published' ? 'var(--spore)' : 'var(--text-mute)', textTransform: 'capitalize' }}>
                {entry.status}
              </span>
              <span style={{ color: 'var(--text-mute)' }}>
                {formatDate(entry.updatedAt)}
              </span>
            </Link>
          ))}

          {entries.length === 0 && (
            <p style={{ padding: 24, color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
              No hay entradas.
            </p>
          )}
        </div>
      </div>

      <Pagination page={page} total={total} pageSize={pageSize} basePath="/admin/entradas" extraParams={extraParams} />
    </div>
  )
}
