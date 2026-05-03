import Link from 'next/link'
import { KPICard } from '@/components/admin/KPICard'
import { getAdminDashboard } from '@/lib/supabase/queries/admin'
import { relativeTime } from '@/lib/utils/dates'

export default async function AdminPage() {
  const data = await getAdminDashboard()
  return (
    <div>
      <h1 style={titleStyle}>Dashboard arcano</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KPICard label="Entradas" value={data.totalEntries} />
        <KPICard label="Comentarios" value={data.totalComments} color="var(--mist)" />
        <KPICard label="Usuarios" value={data.totalUsers} color="var(--rune)" />
        <KPICard label="XP repartido" value={data.totalXp} color="var(--amethyst)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <section style={panelStyle}>
          <h2 style={sectionStyle}>Entradas recientes</h2>
          {data.recentEntries.map(entry => <Link key={entry.id} href={`/admin/entradas/${entry.id}`} style={rowStyle}><span>{entry.title}</span><small>{entry.status}</small></Link>)}
        </section>
        <section style={panelStyle}>
          <h2 style={sectionStyle}>Cola de moderación</h2>
          {data.recentComments.map(comment => <div key={comment.id} style={rowStyle}><span dangerouslySetInnerHTML={{ __html: comment.deleted ? 'Comentario eliminado' : comment.body.slice(0, 90) }} /><small>{relativeTime(comment.createdAt)}</small></div>)}
        </section>
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }
const sectionStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 16px' }
const panelStyle: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 20 }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-soft)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 14 }
