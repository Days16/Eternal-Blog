'use client'

import { useEffect } from 'react'
import { useRealtimeAchievements } from './useRealtimeAchievements'

type Props = { userId: string | null | undefined }

export function AchievementToast({ userId }: Props) {
  const { notifications, dismiss } = useRealtimeAchievements(userId)

  useEffect(() => {
    // Auto-dismiss tras 6 s
    for (const n of notifications) {
      const t = setTimeout(() => dismiss(n.id), 6000)
      return () => clearTimeout(t)
    }
  }, [notifications, dismiss])

  if (notifications.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            background: 'var(--moss-800)',
            border: '1px solid var(--spore)',
            borderRadius: 'var(--r-lg)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            animation: 'fadeInUp 0.3s ease',
            minWidth: 280,
          }}
        >
          <span style={{ fontSize: 28 }}>ᛟ</span>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--spore)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>
              Logro desbloqueado
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)' }}>
              Un nuevo sello ha sido grabado
            </div>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
