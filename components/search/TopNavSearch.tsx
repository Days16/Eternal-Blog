'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SearchResult } from '@/lib/search/orama'

export function TopNavSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (q.trim().length < 2) { setResults([]); return }
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      const payload = await response.json().catch(() => ({ results: [] }))
      setResults((payload.results ?? []).slice(0, 5))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [q])

  return (
    <div style={{ position: 'relative', minWidth: 260 }}>
      <input value={q} onChange={event => setQ(event.target.value)} placeholder="Buscar en el grimorio…" style={{ width: '100%', padding: '8px 14px', background: 'var(--moss-800)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 12 }} />
      {results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 8, zIndex: 20, boxShadow: 'var(--shadow-lg)' }}>
          {results.map(result => <Link key={result.id} href={`/${result.type === 'codex' ? 'codex' : 'cronicas'}/${result.slug}`} style={{ display: 'block', padding: 8, color: 'var(--text)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 12 }}>{result.title}</Link>)}
          <Link href={`/buscar?q=${encodeURIComponent(q)}`} style={{ display: 'block', borderTop: '1px solid var(--border-soft)', marginTop: 6, padding: 8, color: 'var(--spore)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 12 }}>Ver todos los resultados</Link>
        </div>
      )}
    </div>
  )
}
