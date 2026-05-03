import Link from 'next/link'
import { KPICard } from '@/components/admin/KPICard'
import { getAdminDashboard } from '@/lib/supabase/queries/admin'
import { relativeTime } from '@/lib/utils/dates'
import { auth } from '@/auth'

export default async function AdminPage() {
  const session = await auth()
  const isMod = session?.user?.role === 'moderator'
  const isDev = session?.user?.role === 'dev'
  const data = await getAdminDashboard()
  
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <header style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ ...titleStyle, margin: 0 }}>{isDev ? 'Sanctum' : (isMod ? 'Moderación' : 'Dashboard')}</h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 14, fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: '4px 0 0' }}>
            Estado del bosque: Sereno.
          </p>
        </div>
        <Link href="/grimorio" style={{ color: 'var(--spore)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
          ABRIR GRIMORIO ↗
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
        <KPICard label="Entradas" value={data.totalEntries} />
        <KPICard label="Comentarios" value={data.totalComments} color="var(--mist)" />
        {!isMod && <KPICard label="Usuarios" value={data.totalUsers} color="var(--rune)" />}
        {!isMod && <KPICard label="XP Total" value={data.totalXp.toLocaleString('es-ES')} color="var(--amethyst)" />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
          <h2 style={{ ...sectionStyle, fontSize: 18, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2 }}>Actividad Reciente</h2>
          <div style={{ display: 'grid', gap: 1, marginTop: 20 }}>
            {data.recentEntries.map(entry => (
              <Link key={entry.id} href={`/admin/entradas/${entry.id}`} style={{ ...rowStyle, padding: '12px 0' }} className="hover-glow">
                <span style={{ color: 'var(--text)' }}>{entry.title}</span>
                <span style={{ fontSize: 10, color: 'var(--text-mute)' }}>{entry.type}</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
          <h2 style={{ ...sectionStyle, fontSize: 18, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2 }}>Moderación</h2>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            {data.recentComments.map(comment => (
              <div key={comment.id} style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.4, marginBottom: 4 }} 
                     dangerouslySetInnerHTML={{ __html: comment.deleted ? '<em>Borrado</em>' : (comment.body ?? '').replace(/<[^>]*>/g, '').slice(0, 80) + '...' }} />
                <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>{relativeTime(comment.createdAt)}</div>
              </div>
            ))}
          </div>
          <Link href="/admin/comentarios" style={{ display: 'block', marginTop: 20, color: 'var(--spore)', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
            VER TODO →
          </Link>
        </section>
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }
const sectionStyle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 16px' }
const panelStyle: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 20 }
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-soft)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 14 }
