'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ForoThreadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[foro/thread]', error?.message ?? 'unknown', error?.digest ?? 'no-digest')
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, opacity: 0.2 }}>ᚢ</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
        El pergamino se ha perdido
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontStyle: 'italic', color: 'var(--text-mute)', maxWidth: 400, margin: 0 }}>
        No se pudo cargar este hilo del foro. Puede ser un problema temporal.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            fontFamily: 'var(--font-ui)', fontSize: 13, padding: '10px 20px',
            background: 'var(--spore)', color: 'var(--moss-950)',
            border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Reintentar
        </button>
        <Link
          href="/foro"
          style={{
            fontFamily: 'var(--font-ui)', fontSize: 13, padding: '10px 20px',
            background: 'var(--bg-card)', color: 'var(--text-soft)',
            border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)',
            textDecoration: 'none',
          }}
        >
          Volver al foro
        </Link>
      </div>
    </div>
  )
}
