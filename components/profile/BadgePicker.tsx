'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/utils/fetcher'

interface BadgeAchievement {
  id: string
  name: string
  badgeIcon: string | null
  description: string | null
}

export function BadgePicker() {
  const { data, mutate } = useSWR<{ badges: BadgeAchievement[]; activeId: string | null }>(
    '/api/profile/badge',
    fetcher,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const badges = data?.badges ?? []
  const activeId = data?.activeId ?? null

  async function selectBadge(id: string | null) {
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await fetch('/api/profile/badge', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId: id }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'No se pudo actualizar la insignia.')
    }
    await mutate()
    setBusy(false)
  }

  if (badges.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic', margin: 0 }}>
        Aún no has desbloqueado ningún logro con insignia. Sigue participando en la comunidad.
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {badges.map(badge => {
          const isActive = badge.id === activeId
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => selectBadge(isActive ? null : badge.id)}
              disabled={busy}
              title={`${badge.name}${badge.description ? ` — ${badge.description}` : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: isActive ? 'rgba(212,166,74,0.15)' : 'var(--moss-800)',
                border: `1px solid ${isActive ? 'var(--spore)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.6 : 1,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {badge.badgeIcon && (
                <span style={{ fontSize: 18, lineHeight: 1 }}>{badge.badgeIcon}</span>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--spore)' : 'var(--text)' }}>
                  {badge.name}
                </div>
                {isActive && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--spore)', marginTop: 1 }}>
                    Activa · clic para quitar
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ember)' }}>
          {error}
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', margin: 0 }}>
        La insignia activa aparece junto a tu nombre en comentarios y en el foro. Haz clic en una insignia activa para desactivarla.
      </p>
    </div>
  )
}
