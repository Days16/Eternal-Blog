import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAdminForumStats, getForumCategories } from '@/lib/supabase/queries/forum'
import { relativeTime } from '@/lib/utils/dates'
import { deleteThreadAction } from '@/app/foro/actions'

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
  margin: '0 0 20px',
  letterSpacing: 0.3,
}

export default async function AdminForoPage() {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user?.id || (role !== 'admin' && role !== 'dev' && role !== 'moderator')) {
    redirect('/login')
  }

  const [stats, categories] = await Promise.all([
    getAdminForumStats(),
    getForumCategories(),
  ])

  return (
    <div className="admin-page">

      {/* Cabecera */}
      <header style={{ marginBottom: 36 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 6px', fontWeight: 600 }}>
          Moderación · Foro
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: -0.5 }}>
            El ágora
          </h1>
          <Link
            href="/foro"
            style={{
              padding: '10px 18px',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-ui)', fontSize: 12,
              color: 'var(--text-mute)', textDecoration: 'none',
            }}
          >
            Ver foro público ↗
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid-kpis" style={{ marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Hilos</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--spore)' }}>{stats.threadCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Respuestas</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--mist)' }}>{stats.replyCount}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Categorías</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--moss-300)' }}>{categories.length}</div>
        </div>
      </div>

      {/* Categorías */}
      <section style={cardStyle}>
        <h2 style={sectionLabelStyle}>Categorías</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 80px 80px',
              alignItems: 'center',
              gap: 16,
              padding: '12px 4px',
              borderBottom: i < categories.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}>
              <span style={{ fontSize: 18, color: cat.color, textAlign: 'center' }}>{cat.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cat.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-mute)', fontStyle: 'italic' }}>{cat.description}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mute)', textAlign: 'right' }}>
                {cat.threadCount ?? 0} hilos
              </span>
              <Link
                href={`/foro/${cat.slug}`}
                style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--mist)', textDecoration: 'none', textAlign: 'right' }}
              >
                Ver ↗
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Últimos hilos */}
      <section style={cardStyle}>
        <h2 style={sectionLabelStyle}>Últimos hilos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {stats.recentThreads.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic' }}>
              Sin hilos todavía.
            </p>
          ) : (
            stats.recentThreads.map((thread, i) => (
              <div
                key={thread.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '13px 0',
                  borderBottom: i < stats.recentThreads.length - 1 ? '1px solid var(--border-soft)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {thread.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-mute)' }}>
                    {thread.author?.name ?? thread.author?.username ?? 'Anónimo'} · {thread.category?.name} · {relativeTime(thread.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {thread.category && (
                    <Link
                      href={`/foro/${thread.category.slug}/${thread.slug}`}
                      style={{
                        padding: '5px 12px',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 'var(--r-sm)',
                        fontFamily: 'var(--font-ui)', fontSize: 11,
                        color: 'var(--text-soft)', textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Ver
                    </Link>
                  )}
                  <form action={deleteThreadAction} style={{ display: 'inline' }}>
                    <input type="hidden" name="thread_id" value={thread.id} />
                    <input type="hidden" name="category_slug" value={thread.category?.slug ?? ''} />
                    <button
                      type="submit"
                      style={{
                        padding: '5px 12px',
                        border: '1px solid var(--ember)',
                        borderRadius: 'var(--r-sm)',
                        background: 'transparent',
                        fontFamily: 'var(--font-ui)', fontSize: 11,
                        color: 'var(--ember)', cursor: 'pointer',
                        fontWeight: 500,
                      }}
                      onClick={e => { if (!confirm('¿Eliminar este hilo?')) e.preventDefault() }}
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  )
}
