'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SearchResult } from '@/lib/search/orama'

type SearchClientProps = { initialQuery: string; initialType: string }

export function SearchClient({ initialQuery, initialType }: SearchClientProps) {
  const [q, setQ] = useState(initialQuery)
  const [type, setType] = useState(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (!q.trim()) { setResults([]); return }
      setLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`)
      const payload = await response.json().catch(() => ({ results: [] }))
      setResults(payload.results ?? [])
      setLoading(false)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [q, type])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input value={q} onChange={event => setQ(event.target.value)} placeholder="Busca silbadores, runas, archimagos…" style={{ flex: 1, background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', padding: 14, fontFamily: 'var(--font-body)', fontSize: 16 }} />
        <select value={type} onChange={event => setType(event.target.value)} style={{ background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', padding: 14 }}>
          <option value="all">Todo</option><option value="chronicle">Crónicas</option><option value="codex">Codex</option>
        </select>
      </div>
      {q.toLowerCase().includes('archimago') && <div style={{ marginBottom: 18, padding: 14, border: '1px solid var(--amethyst)', borderRadius: 'var(--r-md)', color: 'var(--amethyst)', fontFamily: 'var(--font-display)' }}>ᛗ El grimorio reconoce la palabra del Archimago.</div>}
      {loading && <p style={{ color: 'var(--text-mute)' }}>Consultando el grimorio…</p>}
      {!loading && q && results.length === 0 && <p style={{ color: 'var(--text-mute)', fontStyle: 'italic' }}>El grimorio no encontró rastro de ese conjuro.</p>}
      <div style={{ display: 'grid', gap: 14 }}>
        {results.map(result => <Link key={result.id} href={`/${result.type === 'codex' ? 'codex' : 'cronicas'}/${result.slug}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 18, color: 'var(--text)', textDecoration: 'none' }}><div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--spore)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{result.type === 'codex' ? 'Codex' : 'Crónica'}</div><h2 style={{ fontFamily: 'var(--font-display)', margin: '6px 0', fontSize: 26 }}>{result.title}</h2><p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)', margin: 0 }}>{result.snippet}</p></Link>)}
      </div>
    </div>
  )
}
