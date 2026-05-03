import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { EntryCard } from '@/components/content/EntryCard'
import { Rune } from '@/components/ui/Rune'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Btn } from '@/components/ui/Btn'
import {
  getPublishedChronicles,
  getAuthorWordCount,
} from '@/lib/supabase/queries/entries'
import { getTopReaders } from '@/lib/supabase/queries/users'
import type { LevelNumber } from '@/components/ui/constants'

export const metadata: Metadata = {
  title: 'Crónicas',
  description: 'Notas de campo, guías de escritura y fragmentos del bosque. Bitácora arcana de un escritor en formación.',
}

type SearchParams = Promise<{ page?: string; tag?: string }>

export default async function CronicasPage({ searchParams }: { searchParams: SearchParams }) {
  const { page: pageStr, tag } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const [chronicles, topReaders, authorWords] = await Promise.all([
    getPublishedChronicles({ page, tag }),
    getTopReaders(3),
    getAuthorWordCount('admin-001'),
  ])

  const GOAL = 90_000
  const progress = Math.min(100, Math.round((authorWords / GOAL) * 100))

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ padding: '72px 64px 56px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 80, right: 80, opacity: 0.2, fontFamily: 'var(--font-display)', color: 'var(--rune)', fontSize: 56, lineHeight: 1 }}>
          ᛉ
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--spore)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 24, height: 1, background: 'var(--spore)', display: 'inline-block' }} />
          Bitácora arcana de un escritor en formación
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 88, fontWeight: 500, color: 'var(--text)', lineHeight: 0.95, letterSpacing: -2, margin: '0 0 20px', maxWidth: 880 }}>
          Notas del bosque<br />
          <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>donde las palabras germinan</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 19, color: 'var(--text-soft)', maxWidth: 620, lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
          Aquí guardo lo que aprendo escribiendo · borradores, criaturas, mapas mentales y los caminos sin salida que también enseñan.
        </p>
      </section>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 48, padding: '0 64px 96px', alignItems: 'flex-start' }}>
        {/* Feed */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <RuneDivider char="✦ ÚLTIMAS CRÓNICAS ✦" />

          {chronicles.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>
              El grimorio está vacío… por ahora.
            </p>
          ) : (
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
              {chronicles.map((entry, i) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  isLast={i === chronicles.length - 1}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {chronicles.length === 10 && (
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <Link href={`/cronicas?page=${page + 1}${tag ? `&tag=${tag}` : ''}`}>
                <Btn variant="rune" size="lg">Convocar más entradas</Btn>
              </Link>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Grimorio en curso */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
                El grimorio en curso
              </span>
              <Rune char="ᛉ" size={14} opacity={0.6} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 4, letterSpacing: -0.5, lineHeight: 1.15 }}>
              La Ceniza Verde
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic', marginBottom: 20 }}>
              Tomo I · novela en progreso
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', marginBottom: 6 }}>
                <span>{authorWords.toLocaleString('es-ES')} palabras</span>
                <span>de {GOAL.toLocaleString('es-ES')}</span>
              </div>
              <div style={{ height: 6, background: 'var(--moss-800)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--spore-dim), var(--spore))', boxShadow: 'var(--glow-spore)' }} />
              </div>
            </div>
          </div>

          {/* Cronistas destacados */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Rune char="ᛗ" size={14} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
                Cronistas destacados
              </span>
            </div>
            {topReaders.map((u, i) => (
              <Link key={u.id} href={`/perfil/${u.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', width: 16 }}>#{i + 1}</span>
                <LevelBadge level={(u.level) as LevelNumber} size={22} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name}
                  </div>
                  {u.specialRole && (
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--amethyst)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {u.specialRole}
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                  {u.xp.toLocaleString('es-ES')}
                </span>
              </Link>
            ))}
          </div>

        </aside>
      </div>

      <Footer />
    </div>
  )
}
