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
  if (type) extraParams.type = type
  if (status) extraParams.status = status

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: 0 }}>Entradas</h1>
        <Link href="/admin/entradas/nueva"><Btn variant="rune">Nueva entrada</Btn></Link>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {entries.map(entry => (
          <Link key={entry.id} href={`/admin/entradas/${entry.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 140px', gap: 16, padding: 16, borderBottom: '1px solid var(--border-soft)', color: 'var(--text)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
            <span>{entry.title}</span><span>{entry.type}</span><span>{entry.status}</span><span>{formatDate(entry.updatedAt)}</span>
          </Link>
        ))}
        {entries.length === 0 && (
          <p style={{ padding: 24, color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>No hay entradas.</p>
        )}
      </div>
      <Pagination page={page} total={total} pageSize={pageSize} basePath="/admin/entradas" extraParams={extraParams} />
    </div>
  )
}
