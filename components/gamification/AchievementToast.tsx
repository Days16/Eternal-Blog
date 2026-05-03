'use client'

import { useEffect, useState } from 'react'

export function AchievementToast() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      setMessage(detail?.message ?? 'Logro desbloqueado')
      window.setTimeout(() => setMessage(null), 5000)
    }
    window.addEventListener('eternidad:toast', handler)
    return () => window.removeEventListener('eternidad:toast', handler)
  }, [])

  if (!message) return null
  return (
    <div aria-live="polite" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--rune)', borderRadius: 'var(--r-lg)', padding: 18, boxShadow: 'var(--glow-spore)', color: 'var(--text)' }}>
      <div style={{ fontFamily: 'var(--font-display)', color: 'var(--rune)', fontSize: 22 }}>ᛟ Sello roto</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>{message}</div>
    </div>
  )
}
