'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type ReactionControlProps = {
  entryId: string
  currentUserId?: string | null
}

export function ReactionControl({ entryId, currentUserId }: ReactionControlProps) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  
  const REACTION_TYPES = [
    { icon: '🍄', label: 'Magia',    kind: 'magic',   color: 'var(--spore)' },
    { icon: '✦',  label: 'Brillante', kind: 'bright',  color: 'var(--rune)' },
    { icon: '◊',  label: 'Inquieta', kind: 'uneasy',  color: 'var(--mist)' },
    { icon: '☾',  label: 'Soñador',  kind: 'dreamer', color: 'var(--amethyst)' },
  ]

  const { data: counts, mutate } = useSWR(`/api/reactions?entryId=${entryId}`, fetcher)

  async function handleReact(kind: string) {
    if (!currentUserId || busy) return
    setBusy(kind)
    
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, kind })
      })
      
      if (res.ok) {
        mutate() // Refrescar datos locales
        router.refresh() // Refrescar servidor para XP/Logros
      } else {
        const payload = await res.json().catch(() => ({}))
        alert(`Error al reaccionar: ${payload.error || 'Error desconocido'}`)
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={{ paddingRight: 64, paddingLeft: 32, position: 'sticky', top: 100 }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 16 }}>
        Reacciona
      </div>
      {REACTION_TYPES.map((r) => {
        const count = counts?.[r.kind] ?? 0
        const isActive = counts?.userReactions?.includes(r.kind)
        
        return (
          <button
            key={r.kind}
            disabled={!currentUserId || !!busy}
            onClick={() => handleReact(r.kind)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '10px 14px',
              background: isActive ? 'var(--moss-700)' : 'var(--moss-800)',
              border: isActive ? `1px solid ${r.color}` : '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)',
              cursor: currentUserId ? 'pointer' : 'default',
              marginBottom: 8,
              fontFamily: 'var(--font-ui)',
              color: isActive ? 'var(--text)' : 'var(--text-soft)',
              transition: 'all 0.2s ease',
              opacity: busy === r.kind ? 0.6 : 1,
              boxShadow: isActive ? `0 0 12px ${r.color}22` : 'none'
            }}
            className={currentUserId ? 'hover-glow' : ''}
          >
            <span style={{ fontSize: 18, filter: isActive ? 'none' : 'grayscale(0.5) opacity(0.7)' }}>{r.icon}</span>
            <span style={{ fontSize: 13, flex: 1, textAlign: 'left', fontWeight: isActive ? 600 : 400 }}>{r.label}</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: isActive ? r.color : 'var(--text-mute)' }}>
              {count}
            </span>
          </button>
        )
      })}
      {!currentUserId && (
        <div style={{ fontSize: 9, color: 'var(--text-mute)', textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-ui)', letterSpacing: 1 }}>
          INICIA SESIÓN PARA REACCIONAR
        </div>
      )}
    </div>
  )
}

