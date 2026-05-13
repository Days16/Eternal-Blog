import type { Metadata } from 'next'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { Rune } from '@/components/ui/Rune'
import { ForumCategoryCard } from '@/components/forum/ForumCategoryCard'
import { getForumCategories } from '@/lib/supabase/queries/forum'

export const metadata: Metadata = {
  title: 'Foro · ETERNIDAD',
  description: 'El ágora del bosque. Teorías, preguntas, fan-art y conversación general sobre ETERNIDAD.',
}

export default async function ForoPage() {
  const categories = await getForumCategories()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="page-hero page-hero-transition" style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 80, right: 80,
          opacity: 0.15, fontFamily: 'var(--font-display)',
          color: 'var(--rune)', fontSize: 60, lineHeight: 1,
        }}>
          ᚷ
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: 3, color: 'var(--spore)', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 24, height: 1, background: 'var(--spore)', display: 'inline-block' }} />
          El ágora del bosque
        </div>
        <h1
          className="hero-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            color: 'var(--text)',
            lineHeight: 0.95,
            letterSpacing: -2,
            margin: '0 0 20px',
            maxWidth: 820,
          }}
        >
          Foro<br />
          <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>donde los pergaminos se cruzan</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(15px, 2.5vw, 19px)',
          color: 'var(--text-soft)',
          maxWidth: 580,
          lineHeight: 1.55,
          fontStyle: 'italic',
          margin: 0,
        }}>
          Comparte teorías, preguntas y creaciones. Un lugar de encuentro para los lectores del bosque.
        </p>
      </section>

      {/* ── Categorías ───────────────────────────────────── */}
      <div className="main-flex page-layout">
        <main className="page-main">
          <RuneDivider char="✦ PERGAMINOS DEL BOSQUE ✦" />

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map(category => (
              <ForumCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Rune char="ᚺ" size={14} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
                Normas del ágora
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Respeta a todos los viajeros del bosque.',
                'Evita los spoilers sin marcarlos.',
                'Los hilos de fan-art van en Ofrenda.',
                'No compartas contenido externo sin contexto.',
                'El moderador tiene la última palabra.',
              ].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--spore)', marginTop: 2, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Rune char="ᛉ" size={14} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
                XP en el foro
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Crear un hilo', xp: '+10 XP' },
                { label: 'Responder', xp: '+5 XP' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-soft)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--spore)', fontWeight: 600 }}>{item.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}
