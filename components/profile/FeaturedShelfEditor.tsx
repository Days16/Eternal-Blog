'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils/fetcher'

interface FeaturedEntry {
  position: number
  id: string
  slug: string
  title: string
  type: string
}

interface SearchResult {
  id: string
  slug: string
  title: string
  type: string
}

function Slot({
  position,
  entry,
  onRemove,
  onAdd,
}: {
  position: number
  entry?: FeaturedEntry
  onRemove: (pos: number) => Promise<void>
  onAdd: (entryId: string, pos: number) => Promise<void>
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`)
      const data = await res.json()
      setResults((data.results ?? []).slice(0, 8))
      setShowDropdown(true)
      setSearching(false)
    }, 350)
  }, [query])

  async function handleRemove() {
    setBusy(true)
    await onRemove(position)
    setBusy(false)
  }

  async function handleSelect(result: SearchResult) {
    setBusy(true)
    setShowDropdown(false)
    setQuery('')
    await onAdd(result.id, position)
    setBusy(false)
  }

  const slotStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    background: 'var(--moss-800)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)',
    minHeight: 58,
  }

  if (entry) {
    return (
      <div style={slotStyle}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--spore)', flexShrink: 0, opacity: 0.7 }}>
          #{position}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.title}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {entry.type === 'codex' ? 'Códex' : 'Crónica'}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', fontFamily: 'var(--font-ui)', fontSize: 11, flexShrink: 0, opacity: busy ? 0.5 : 1 }}
        >
          Quitar
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ ...slotStyle, gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--spore)', flexShrink: 0, opacity: 0.4 }}>
          #{position}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar artículo para destacar…"
          disabled={busy}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
            opacity: busy ? 0.5 : 1,
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {searching && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)' }}>…</span>
        )}
      </div>
      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--moss-800)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', marginTop: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          maxHeight: 220, overflowY: 'auto',
        }}>
          {results.map(r => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => handleSelect(r)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--moss-700)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--spore)', flexShrink: 0 }}>
                {r.type === 'codex' ? 'Códex' : 'Crónica'}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FeaturedShelfEditor() {
  const { data, mutate } = useSWR<{ entries: FeaturedEntry[] }>('/api/profile/featured', fetcher)
  const entries = data?.entries ?? []
  const [error, setError] = useState<string | null>(null)

  const entryAtPos = (pos: number) => entries.find(e => e.position === pos)

  async function handleAdd(entryId: string, position: number) {
    setError(null)
    const res = await fetch('/api/profile/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, position }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'No se pudo añadir el artículo.')
    }
    mutate()
  }

  async function handleRemove(position: number) {
    setError(null)
    const res = await fetch('/api/profile/featured', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'No se pudo quitar el artículo.')
    }
    mutate()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(pos => (
        <Slot
          key={pos}
          position={pos}
          entry={entryAtPos(pos)}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      ))}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ember)' }}>
          {error}
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', margin: 0 }}>
        Los artículos destacados aparecen en tu perfil público.
      </p>
    </div>
  )
}
