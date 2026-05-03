import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CODEX_CATEGORIES } from '@/lib/supabase/queries/entries'
import { mapEntry } from '@/lib/supabase/helpers'

export const metadata = {
  title: 'El Grimorio',
  description: 'El índice completo de crónicas y conocimientos arcanos.',
}

export default async function GrimorioPage() {
  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  // Obtener todas las entradas publicadas ordenadas por título
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('status', 'published')
    .order('title', { ascending: true })

  const mappedEntries = (entries ?? []).map(mapEntry)
  
  const chronicles = mappedEntries.filter(e => e.type === 'chronicle')
  const codexEntries = mappedEntries.filter(e => e.type === 'codex')

  // Agrupar codex por categoría
  const codexByCategory = CODEX_CATEGORIES.map(cat => ({
    ...cat,
    entries: codexEntries.filter(e => e.category === cat.id)
  })).filter(cat => cat.entries.length > 0)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 48px 120px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--spore)', letterSpacing: 6, marginBottom: 16 }}>
            BIBLIOTECA DE ETERNIDAD
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 72, margin: '0 0 16px', letterSpacing: -2 }}>
            El Grimorio
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--text-mute)', maxWidth: 600, margin: '0 auto', fontStyle: 'italic' }}>
            Un compendio exhaustivo de cada palabra escrita, cada criatura avistada y cada rincón explorado del bosque.
          </p>
        </div>

        <section style={{ marginBottom: 80 }}>
          <RuneDivider char="✦ CRÓNICAS ✦" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginTop: 32 }}>
            {chronicles.map(e => (
              <Link key={e.id} href={`/cronicas/${e.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={entryLinkStyle}>
                  <span style={{ color: 'var(--spore)', marginRight: 8 }}>ᛉ</span>
                  {e.title}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <RuneDivider char="✦ EL CODEX ✦" />
          <div style={{ display: 'grid', gap: 48, marginTop: 40 }}>
            {codexByCategory.map(cat => (
              <div key={cat.id}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: cat.color, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>{cat.rune}</span>
                  {cat.name}
                  <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${cat.color}44, transparent)` }} />
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {cat.entries.map(e => (
                    <Link key={e.id} href={`/codex/${e.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={entryLinkStyle}>
                        {e.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const entryLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  color: 'var(--text-soft)',
  padding: '12px 16px',
  background: 'var(--moss-900)',
  border: '1px solid var(--border-soft)',
  borderRadius: 'var(--r-md)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}
