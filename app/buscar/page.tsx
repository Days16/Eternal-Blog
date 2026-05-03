import { Footer } from '@/components/layout/Footer'
import { TopNav } from '@/components/layout/TopNav'
import { SearchClient } from '@/components/search/SearchClient'

type Props = { searchParams: Promise<{ q?: string; type?: string }> }

export const metadata = { title: 'Buscar', description: 'Busca crónicas y artículos del Codex de ETERNIDAD.' }

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 32px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, margin: '0 0 12px' }}>Buscar en el grimorio</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', marginBottom: 32 }}>Encuentra crónicas, lugares, criaturas y notas del Codex.</p>
        <SearchClient initialQuery={params.q ?? ''} initialType={params.type ?? 'all'} />
      </main>
      <Footer />
    </div>
  )
}
