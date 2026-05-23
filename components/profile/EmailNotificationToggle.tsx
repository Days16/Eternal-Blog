'use client'

import { useEffect, useState } from 'react'

export function EmailNotificationToggle() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/newsletter')
      .then(r => r.json())
      .then((data: { subscribed?: boolean }) => setSubscribed(!!data.subscribed))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggle() {
    setSaving(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribe: !subscribed }),
      })
      const data = (await res.json()) as { subscribed?: boolean }
      setSubscribed(!!data.subscribed)
    } catch {
      // no-op
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'var(--bg-card)',
      border: `1px solid ${subscribed ? 'color-mix(in srgb, var(--spore) 40%, var(--border-soft))' : 'var(--border-soft)'}`,
      borderRadius: 'var(--r-lg)',
      gap: 16,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 3 }}>
          Notificaciones por correo
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic' }}>
          {subscribed
            ? 'Recibirás un aviso cuando se publique algo nuevo.'
            : 'Activa para recibir avisos de nuevas publicaciones.'}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        aria-pressed={subscribed}
        style={{
          flexShrink: 0,
          width: 44,
          height: 24,
          borderRadius: 12,
          background: subscribed ? 'var(--spore)' : 'var(--moss-700)',
          border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          opacity: saving ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: subscribed ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: subscribed ? 'var(--moss-900)' : 'var(--text-mute)',
            transition: 'left 0.2s',
          }}
        />
        <span className="sr-only">{subscribed ? 'Desactivar' : 'Activar'} notificaciones por email</span>
      </button>
    </div>
  )
}
