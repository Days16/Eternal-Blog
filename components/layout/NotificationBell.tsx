'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/dates'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type ActivityItem = {
  source: 'activity'
  id: string
  kind: string
  createdAt: string
  xpDelta: number
}

type SocialItem = {
  source: 'social'
  id: string
  type: string
  actorId: string | null
  actorName: string | null
  actorUsername: string | null
  data: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

type NotifItem = ActivityItem | SocialItem

function actorLabel(item: SocialItem) {
  return item.actorName ?? (item.actorUsername ? `@${item.actorUsername}` : 'Alguien')
}

function FriendRequestItem({ item, onDone }: { item: SocialItem; onDone: () => void }) {
  const [busy, setBusy] = useState<'accepted' | 'rejected' | null>(null)
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null)

  async function respond(status: 'accepted' | 'rejected') {
    const friendshipId = item.data?.friendshipId as string | undefined
    if (!friendshipId || busy) return
    setBusy(status)
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'friend_respond', friendshipId, status }),
    })
    setDone(status)
    setBusy(null)
    onDone()
  }

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--amethyst)', fontSize: 16, marginTop: 2 }}>✦</span>
        <div style={{ flex: 1 }}>
          {done ? (
            <div style={{ fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic' }}>
              {done === 'accepted' ? `¡Ahora eres amigo de ${actorLabel(item)}!` : 'Solicitud rechazada.'}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--spore)' }}>{actorLabel(item)}</strong> quiere ser tu amigo
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => respond('accepted')}
                  disabled={!!busy}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--spore)',
                    background: busy === 'accepted' ? 'var(--spore)' : 'transparent',
                    color: busy === 'accepted' ? 'var(--bg)' : 'var(--spore)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: busy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {busy === 'accepted' ? '…' : 'Aceptar'}
                </button>
                <button
                  onClick={() => respond('rejected')}
                  disabled={!!busy}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-mute)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    cursor: busy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {busy === 'rejected' ? '…' : 'Rechazar'}
                </button>
              </div>
            </>
          )}
          <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
            {formatDate(item.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const icon  = item.kind === 'achievement_unlocked' ? '✦' : item.kind === 'daily_streak' ? '☾' : 'ᛗ'
  const color = item.kind === 'achievement_unlocked' ? 'var(--amethyst)' : item.kind === 'daily_streak' ? 'var(--ember)' : 'var(--spore)'

  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ color, fontSize: 16, marginTop: 2 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
            {getActivityText(item)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            {formatDate(item.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialItemRow({ item }: { item: SocialItem }) {
  if (item.type === 'friend_accepted') {
    return (
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ color: 'var(--spore)', fontSize: 16, marginTop: 2 }}>✦</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--spore)' }}>{actorLabel(item)}</strong> aceptó tu solicitud de amistad
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {formatDate(item.createdAt)}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function NotificationBell() {
  const [isOpen, setIsOpen]   = useState(false)
  const [unread, setUnread]   = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: items, mutate, isLoading, error } = useSWR<NotifItem[]>('/api/notifications', fetcher, {
    refreshInterval: 30_000,
  })

  useEffect(() => {
    if (!items) return
    const lastSeen   = parseInt(localStorage.getItem('last_notif_seen') ?? '0')
    const unreadCount = items.filter(n => new Date(n.createdAt).getTime() > lastSeen).length
    setUnread(unreadCount)
  }, [items])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    const next = !isOpen
    setIsOpen(next)
    if (next && items && items.length > 0) {
      localStorage.setItem('last_notif_seen', Date.now().toString())
      setUnread(0)
      fetch('/api/notifications', { method: 'POST' }).catch(() => {})
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={handleOpen}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: unread > 0 ? 'var(--spore)' : 'var(--text-mute)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 8, position: 'relative', transition: 'color 0.2s',
        }}
      >
        <span style={{ fontSize: 20 }}>ᛉ</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 8,
            background: 'var(--ember)',
            boxShadow: '0 0 8px var(--ember)',
            border: '2px solid var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            color: '#fff', padding: '0 3px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 12,
          width: 320, background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100,
          overflow: 'hidden', backdropFilter: 'blur(16px)',
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
              Notificaciones
            </span>
            <button onClick={() => mutate()} style={{ background: 'none', border: 'none', color: 'var(--spore)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              REFRESCAR
            </button>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                Consultando el éter…
              </div>
            ) : error ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ color: 'var(--ember)', fontSize: 13, fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  No se pudo alcanzar el éter.
                </div>
                <button onClick={() => mutate()} style={{ background: 'none', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-sm)', color: 'var(--text-mute)', fontSize: 11, padding: '4px 12px', cursor: 'pointer' }}>
                  Reintentar
                </button>
              </div>
            ) : !items || items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)', fontStyle: 'italic', fontSize: 13 }}>
                El silencio reina en el bosque...
              </div>
            ) : (
              items.map(item => {
                if (item.source === 'social' && item.type === 'friend_request') {
                  return <FriendRequestItem key={item.id} item={item} onDone={() => mutate()} />
                }
                if (item.source === 'social') {
                  return <SocialItemRow key={item.id} item={item} />
                }
                return <ActivityItemRow key={item.id} item={item as ActivityItem} />
              })
            )}
          </div>

          <Link href="/perfil" onClick={() => setIsOpen(false)} style={{ display: 'block', padding: 12, textAlign: 'center', background: 'var(--moss-900)', color: 'var(--text-mute)', fontSize: 11, textDecoration: 'none', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Ver actividad completa
          </Link>
        </div>
      )}
    </div>
  )
}

function getActivityText(n: ActivityItem) {
  switch (n.kind) {
    case 'achievement_unlocked': return <span>¡Has desbloqueado un nuevo <strong>Logro</strong>! +{n.xpDelta} XP</span>
    case 'comment':              return <span>Has publicado un comentario. +{n.xpDelta} XP</span>
    case 'reaction':             return <span>Has reaccionado a una entrada. +{n.xpDelta} XP</span>
    case 'entry_published':      return <span>¡Tu entrada ha sido publicada! +{n.xpDelta} XP</span>
    case 'mission_completed':    return <span>Has completado una misión. +{n.xpDelta} XP</span>
    case 'daily_streak':         return <span>Tu racha diaria sigue viva. +{n.xpDelta} XP</span>
    default:                     return <span>Actividad: {n.kind} (+{n.xpDelta} XP)</span>
  }
}
