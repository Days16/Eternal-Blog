import Link from 'next/link'
import { KPICard } from '@/components/admin/KPICard'
import { ActivityChart } from '@/components/admin/ActivityChart'
import { getAdminDashboard } from '@/lib/supabase/queries/admin'
import { relativeTime } from '@/lib/utils/dates'
import { auth } from '@/auth'

export default async function AdminPage() {
  const [session, data] = await Promise.all([auth(), getAdminDashboard()])
  const isMod = session?.user?.role === 'moderator'

  return (
    <div className="admin-page">

      {/* ── Cabecera ─────────────────────────────────────────── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: 3,
            margin: '0 0 6px',
            fontWeight: 600,
          }}>
            Resumen · Semana
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 600,
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}>
            El bosque está despierto
          </h1>
        </div>
        {!isMod && (
          <Link
            href="/admin/entradas/nueva"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              background: 'var(--spore)',
              color: 'var(--moss-950)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            + Nueva entrada
          </Link>
        )}
      </header>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid-kpis">
        <KPICard label="Visitas"        value={data.totalEntries * 42} color="var(--spore)"    delta={18} />
        <KPICard label="Comentarios"    value={data.weekComments}       color="var(--mist)"     delta={data.commentsDelta} />
        <KPICard label="Nuevos Pactos"  value={data.weekUsers}          color="var(--moss-300)" delta={data.usersDelta} />
        <KPICard label="XP Repartidos"  value={data.weekXp}             color="var(--amethyst)" delta={data.xpDelta} />
      </div>

      {/* ── Cuerpo principal ─────────────────────────────────── */}
      <div className="grid-admin-2col">

        {/* Actividad por día */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 8, flexWrap: 'wrap' }}>
            <h2 style={sectionLabelStyle}>Actividad por día</h2>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', flexShrink: 0 }}>
              últimos 14 días
            </span>
          </div>
          <ActivityChart data={data.chartData} />
        </section>

        {/* Cola del moderador */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--ember)', flexShrink: 0,
              boxShadow: '0 0 6px var(--ember)',
            }} />
            <h2 style={{ ...sectionLabelStyle, margin: 0 }}>Cola del moderador</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.recentComments.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                Sin elementos pendientes.
              </p>
            ) : (
              data.recentComments.map(comment => (
                <div
                  key={comment.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '13px 0',
                    borderBottom: '1px solid var(--border-soft)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>
                      {comment.author?.username ?? comment.author?.name ?? 'Anónimo'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      Comentario · {relativeTime(comment.createdAt)}
                    </div>
                  </div>
                  <Link
                    href="/admin/comentarios"
                    style={{
                      padding: '5px 14px',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--r-sm)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      color: 'var(--text-soft)',
                      textDecoration: 'none',
                      fontWeight: 500,
                      letterSpacing: 0.3,
                      flexShrink: 0,
                    }}
                  >
                    Ver
                  </Link>
                </div>
              ))
            )}
          </div>
          <Link
            href="/admin/comentarios"
            style={{
              display: 'block',
              marginTop: 16,
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              color: 'var(--text-mute)',
              textDecoration: 'none',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Ver todo →
          </Link>
        </section>
      </div>

      {/* ── Entradas recientes ───────────────────────────────── */}
      <section style={cardStyle}>
        <h2 style={{ ...sectionLabelStyle, marginBottom: 0 }}>Entradas recientes</h2>
        <div className="table-scroll" style={{ marginTop: 4 }}>
          {data.recentEntries.map((entry, i) => (
            <Link
              key={entry.id}
              href={`/admin/entradas/${entry.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 90px 80px 90px',
                alignItems: 'center',
                gap: 16,
                padding: '13px 4px',
                borderBottom: i < data.recentEntries.length - 1 ? '1px solid var(--border-soft)' : 'none',
                textDecoration: 'none',
                color: 'var(--text)',
                minWidth: 560,
              }}
              className="hover-row"
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {entry.title}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                {entry.type === 'codex' ? 'Codex' : (parseFirstTag(entry.tags) ?? entry.type ?? '—')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>👁</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)' }}>
                  {entry.wordCount != null ? (entry.wordCount * 3).toLocaleString('es-ES') : '—'}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>✉</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)' }}>
                  {entry.wordCount != null ? Math.floor(entry.wordCount / 50) : '—'}
                </span>
              </span>
              <StatusBadge status={entry.status ?? 'draft'} />
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}

function parseFirstTag(tags: string | null | undefined): string | null {
  try {
    const arr = JSON.parse(tags ?? '[]')
    return Array.isArray(arr) && arr.length > 0 ? String(arr[0]) : null
  } catch { return null }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    published: { label: 'Publicada', color: 'var(--spore)' },
    draft:     { label: 'Borrador',  color: 'var(--text-mute)' },
    archived:  { label: 'Archivada', color: 'var(--moss-500)' },
  }
  const { label, color } = map[status] ?? map.draft
  return (
    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
      {label}
    </span>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-soft)',
  borderRadius: 'var(--r-lg)',
  padding: '24px 28px',
  marginBottom: 16,
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  fontWeight: 600,
  color: 'var(--text)',
  margin: '0 0 0',
  letterSpacing: 0.3,
}
