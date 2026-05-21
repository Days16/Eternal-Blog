'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/dates'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Notification {
  id: string
  kind: string
  createdAt: string
  xpDelta: number
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const { data: notifications, mutate, isLoading, error } = useSWR<Notification[]>('/api/notifications', fetcher, {
    refreshInterval: 60_000,
    onErrorRetry: (err, _key, _cfg, revalidate, { retryCount }) => {
      if (retryCount >= 3) return
      setTimeout(() => revalidate({ retryCount }), 10_000)
    },
  })

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const lastSeen = localStorage.getItem('last_notif_seen')
      const latest = new Date(notifications[0].createdAt).getTime()
      if (!lastSeen || latest > parseInt(lastSeen)) {
        setHasNew(true)
      }
    }
  }, [notifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen && notifications && notifications.length > 0) {
      setHasNew(false)
      localStorage.setItem('last_notif_seen', new Date(notifications[0].createdAt).getTime().toString())
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={handleOpen}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: hasNew ? 'var(--spore)' : 'var(--text-mute)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          position: 'relative',
          transition: 'color 0.2s'
        }}
      >
        <span style={{ fontSize: 20 }}>ᛉ</span>
        {hasNew && (
            <span className="notification-badge-dot" style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--ember)',
            boxShadow: '0 0 8px var(--ember)',
            border: '2px solid var(--bg)'
          }} />
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 12,
          width: 320,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 100,
          overflow: 'hidden',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
              Notificaciones
            </span>
            <button onClick={() => mutate()} style={{ background: 'none', border: 'none', color: 'var(--spore)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>REFRESCAR</button>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                Consultando el éter…
              </div>
            ) : error ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ color: 'var(--ember)', fontSize: 13, fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  No se pudo alcanzar el éter.
                </div>
                <button
                  onClick={() => mutate()}
                  style={{ background: 'none', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-sm)', color: 'var(--text-mute)', fontSize: 11, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
                >
                  Reintentar
                </button>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)', fontStyle: 'italic', fontSize: 13 }}>
                El silencio reina en el bosque...
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: n.kind === 'achievement_unlocked' ? 'var(--amethyst)' : n.kind === 'daily_streak' ? 'var(--ember)' : 'var(--spore)', fontSize: 16 }}>
                      {n.kind === 'achievement_unlocked' ? '✦' : n.kind === 'daily_streak' ? '☾' : 'ᛗ'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
                        {getNotificationText(n)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link href="/perfil" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', background: 'var(--moss-900)', color: 'var(--text-mute)', fontSize: 11, textDecoration: 'none', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Ver actividad completa
          </Link>
        </div>
      )}
    </div>
  )
}

function getNotificationText(n: Notification) {
  switch (n.kind) {
    case 'achievement_unlocked':
      return <span>¡Has desbloqueado un nuevo <strong>Logro</strong>! <br/>Premio: +{n.xpDelta} XP</span>
    case 'comment':
      return <span>Has publicado un comentario. <br/>Ganaste +{n.xpDelta} XP</span>
    case 'reaction':
      return <span>Has reaccionado a una entrada. <br/>Ganaste +{n.xpDelta} XP</span>
    case 'entry_published':
      return <span>¡Tu entrada ha sido publicada! <br/>Ganaste +{n.xpDelta} XP</span>
    case 'mission_completed':
      return <span>Has completado una misión. <br/>Recompensa: +{n.xpDelta} XP</span>
    case 'daily_streak':
      return <span>Tu racha diaria sigue viva. <br/>Bendición: +{n.xpDelta} XP</span>
    default:
      return <span>Actividad registrada: {n.kind} (+{n.xpDelta} XP)</span>
  }
}
