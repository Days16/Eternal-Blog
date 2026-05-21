'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { SearchResult, UserSearchResult } from '@/lib/search/orama'

export function TopNavSearch() {
  const [q, setQ]             = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [users, setUsers]     = useState<UserSearchResult[]>([])
  const [open, setOpen]       = useState(false)
  const wrapperRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (q.trim().length < 2) { setResults([]); setUsers([]); return }
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      const payload  = await response.json().catch(() => ({ results: [], users: [] }))
      setResults((payload.results ?? []).slice(0, 4))
      setUsers((payload.users ?? []).slice(0, 3))
      setOpen(true)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [q])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasResults = results.length > 0 || users.length > 0

  return (
    <div ref={wrapperRef} style={{ position: 'relative', minWidth: 260 }}>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); if (!e.target.value) setOpen(false) }}
        onFocus={() => hasResults && setOpen(true)}
        placeholder="Buscar en el grimorio…"
        style={{
          width: '100%',
          padding: '8px 14px',
          background: 'var(--moss-800)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)',
          color: 'var(--text)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {open && hasResults && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0, right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          padding: 6,
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>

          {/* Usuarios */}
          {users.length > 0 && (
            <div>
              <div style={{ padding: '4px 8px 2px', fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--spore)' }}>
                Usuarios
              </div>
              {users.map(user => (
                <Link
                  key={user.id}
                  href={`/perfil/${user.username ?? user.id}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    borderRadius: 'var(--r-sm)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--moss-700)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--moss-700)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--spore)',
                    overflow: 'hidden',
                  }}>
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (user.name ?? user.username ?? '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name ?? user.username}
                    </div>
                    {user.username && (
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)' }}>
                        @{user.username}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Entradas */}
          {results.length > 0 && (
            <div style={{ marginTop: users.length > 0 ? 4 : 0 }}>
              {users.length > 0 && (
                <div style={{ padding: '4px 8px 2px', fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--spore)' }}>
                  Entradas
                </div>
              )}
              {results.map(result => (
                <Link
                  key={result.id}
                  href={`/${result.type === 'codex' ? 'codex' : 'cronicas'}/${result.slug}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '6px 8px',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 12,
                    borderRadius: 'var(--r-sm)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--moss-700)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {result.title}
                </Link>
              ))}
            </div>
          )}

          {/* Ver todos */}
          <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 4, paddingTop: 4 }}>
            <Link
              href={`/buscar?q=${encodeURIComponent(q)}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '6px 8px',
                color: 'var(--spore)',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                borderRadius: 'var(--r-sm)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--moss-700)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Ver todos los resultados →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
