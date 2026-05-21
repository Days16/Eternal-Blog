'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SearchResult, UserSearchResult } from '@/lib/search/orama'

const LEVELS: Record<number, string> = {
  1: 'Aprendiz', 2: 'Iniciado', 3: 'Adepto', 4: 'Druida', 5: 'Archimago',
}

function initials(name: string | null, username: string | null) {
  const src = name ?? username ?? '?'
  return src.charAt(0).toUpperCase()
}

type SearchClientProps = { initialQuery: string; initialType: string }

export function SearchClient({ initialQuery, initialType }: SearchClientProps) {
  const [q, setQ]             = useState(initialQuery)
  const [type, setType]       = useState(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [users, setUsers]     = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (!q.trim()) { setResults([]); setUsers([]); return }
      setLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`)
      const payload  = await response.json().catch(() => ({ results: [], users: [] }))
      setResults(payload.results ?? [])
      setUsers(payload.users ?? [])
      setLoading(false)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [q, type])

  const totalResults = results.length + users.length
  const isEmpty = q.trim() && !loading && totalResults === 0

  return (
    <div>
      {/* Barra de búsqueda */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Busca crónicas, runas, usuarios…"
          style={{
            flex: 1,
            background: 'var(--moss-950)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
            padding: 14,
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            outline: 'none',
          }}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{
            background: 'var(--moss-950)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
            padding: '0 14px',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
          }}
        >
          <option value="all">Todo</option>
          <option value="chronicle">Crónicas</option>
          <option value="codex">Codex</option>
          <option value="users">Usuarios</option>
        </select>
      </div>

      {/* Easter egg */}
      {q.toLowerCase().includes('archimago') && (
        <div style={{ marginBottom: 18, padding: 14, border: '1px solid var(--amethyst)', borderRadius: 'var(--r-md)', color: 'var(--amethyst)', fontFamily: 'var(--font-display)' }}>
          ᛗ El grimorio reconoce la palabra del Archimago.
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-body)' }}>Consultando el grimorio…</p>}
      {isEmpty  && <p style={{ color: 'var(--text-mute)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>El grimorio no encontró rastro de ese conjuro.</p>}

      {/* Usuarios */}
      {users.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 12 }}>
            ✦ Usuarios
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {users.map(user => (
              <Link
                key={user.id}
                href={`/perfil/${user.username ?? user.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
              >
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: user.avatarUrl ? 'transparent' : 'var(--moss-700)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--spore)',
                  overflow: 'hidden',
                }}>
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials(user.name, user.username)
                  }
                </div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name ?? user.username ?? 'Usuario'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.username ? `@${user.username}` : ''}
                    {user.username && user.level ? ' · ' : ''}
                    {user.level ? (LEVELS[user.level] ?? `Nv. ${user.level}`) : ''}
                  </div>
                  {user.bio && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.bio}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Entradas */}
      {results.length > 0 && (
        <div>
          {users.length > 0 && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 12 }}>
              ✦ Entradas
            </div>
          )}
          <div style={{ display: 'grid', gap: 14 }}>
            {results.map(result => (
              <Link
                key={result.id}
                href={`/${result.type === 'codex' ? 'codex' : 'cronicas'}/${result.slug}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: 18,
                  color: 'var(--text)',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
              >
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--spore)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {result.type === 'codex' ? 'Codex' : 'Crónica'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: '6px 0', fontSize: 26 }}>
                  {result.title}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)', margin: 0, lineHeight: 1.6 }}>
                  {result.snippet}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
