import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { CategoryChip } from '@/components/content/CategoryChip'
import { WikiCard } from '@/components/content/WikiCard'
import { RuneDivider } from '@/components/ui/RuneDivider'
import {
  CODEX_CATEGORIES,
  getCodexStats,
  getCodexEntries,
} from '@/lib/supabase/queries/entries'

export const metadata: Metadata = {
  title: 'Codex',
  description: 'Toda la memoria del bosque. Entradas vivas que se reescriben con cada borrador.',
}

type SearchParams = Promise<{ category?: string }>

export default async function CodexPage({ searchParams }: { searchParams: SearchParams }) {
  const { category } = await searchParams

  const [stats, entries] = await Promise.all([
    getCodexStats().catch(() => ({} as Record<string, number>)),
    getCodexEntries(category).catch(() => []),
  ])

  const totalEntries = Object.values(stats).reduce((a, b) => a + b, 0)
  const activeCat = category ? CODEX_CATEGORIES.find(c => c.id === category) : null

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="page-hero page-hero-transition" style={{ textAlign: 'center' }}>
        <div className="reveal" style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--rune)', marginBottom: 16 }}>
          ✦ EL CODEX ✦
        </div>
        <h1 className="hero-title reveal reveal-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: -1.5, margin: '0 0 16px', lineHeight: 1 }}>
          Toda la <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>memoria</em> del bosque
        </h1>
        <p className="reveal reveal-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2.5vw, 17px)', fontStyle: 'italic', color: 'var(--text-soft)', maxWidth: 580, margin: '0 auto', lineHeight: 1.5 }}>
          {totalEntries > 0 ? `${totalEntries} entradas vivas` : 'Entradas'} · que se reescriben con cada borrador
        </p>

        {/* Buscador */}
        <Link
          href="/buscar"
          style={{
            maxWidth: 560,
            margin: '40px auto 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            background: 'var(--moss-800)',
            border: '1px solid var(--border)',
            borderRadius: 99,
            textDecoration: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mute)" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', textAlign: 'left' }}>
            Busca una criatura, un personaje, un hechizo…
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 3, flexShrink: 0 }}>
            ⌘K
          </span>
        </Link>
      </section>

      {/* ── Categorías ────────────────────────────────────── */}
      <section className="page-layout" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {CODEX_CATEGORIES.map(c => (
            <CategoryChip
              key={c.id}
              id={c.id}
              name={c.name}
              rune={c.rune}
              color={c.color}
              count={stats[c.id] ?? 0}
              active={category === c.id}
            />
          ))}
          <Link
            href="/codex/mapa"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 99,
              border: '1px solid var(--border-soft)',
              background: 'var(--bg-card)',
              textDecoration: 'none',
              flexShrink: 0,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--text-mute)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--rune)', lineHeight: 1 }}>ᛗ</span>
            Mapa
          </Link>
        </div>
      </section>

      {/* ── Entradas ──────────────────────────────────────── */}
      <section className="page-layout" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <RuneDivider char={activeCat ? `✦ ${activeCat.name.toUpperCase()} ✦` : '✦ TODAS LAS ENTRADAS ✦'} />

        {entries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: 48,
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            color: 'var(--text-mute)',
            fontSize: 16,
          }}>
            No hay entradas en esta categoría aún.
          </div>
        ) : (
          <div className="grid-codex-featured" style={{ marginTop: 32 }}>
            {entries.map(entry => (
              <WikiCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {activeCat && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              href="/codex"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--text-mute)',
                textDecoration: 'none',
                letterSpacing: 1,
              }}
            >
              ← Ver todas las categorías
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
