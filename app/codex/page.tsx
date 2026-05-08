import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { CategoryCard } from '@/components/content/CategoryCard'
import { WikiCard } from '@/components/content/WikiCard'
import { RuneDivider } from '@/components/ui/RuneDivider'
import {
  CODEX_CATEGORIES,
  getCodexStats,
  getCodexFeatured,
} from '@/lib/supabase/queries/entries'

export const metadata: Metadata = {
  title: 'Codex',
  description: 'Toda la memoria del bosque. 225 entradas vivas que se reescriben con cada borrador.',
}

type SearchParams = Promise<{ category?: string }>

export default async function CodexPage({ searchParams }: { searchParams: SearchParams }) {
  await searchParams

  const [stats, featured] = await Promise.all([
    getCodexStats(),
    getCodexFeatured(3),
  ])

  const totalEntries = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 7vw, 64px) clamp(20px, 5vw, 64px) 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--rune)', marginBottom: 16 }}>
          ✦ EL CODEX ✦
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 8vw, 72px)',
          fontWeight: 500,
          letterSpacing: -1.5,
          margin: '0 0 16px',
          lineHeight: 1,
        }}>
          Toda la <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>memoria</em> del bosque
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2.5vw, 17px)', fontStyle: 'italic', color: 'var(--text-soft)', maxWidth: 580, margin: '0 auto', lineHeight: 1.5 }}>
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
      <section style={{ padding: '32px clamp(20px, 5vw, 64px)' }}>
        <div className="grid-codex-cats">
          {CODEX_CATEGORIES.map(c => (
            <CategoryCard
              key={c.id}
              id={c.id}
              name={c.name}
              rune={c.rune}
              color={c.color}
              desc={c.desc}
              count={stats[c.id] ?? 0}
            />
          ))}
        </div>
      </section>

      {/* ── Featured ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 64px) clamp(64px, 8vw, 96px)' }}>
          <RuneDivider char="✦ DESTACADAS ESTA LUNA ✦" />
          <div className="grid-codex-featured" style={{ marginTop: 32 }}>
            {featured.map(entry => (
              <WikiCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
