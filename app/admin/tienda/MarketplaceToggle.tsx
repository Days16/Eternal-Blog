'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'

export function MarketplaceToggle({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  async function toggle() {
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/marketplace-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    })
    if (res.ok) {
      setEnabled(v => !v)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? `Error ${res.status}`)
    }
    setBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Btn
        type="button"
        variant={enabled ? 'ghost' : 'rune'}
        size="sm"
        disabled={busy}
        onClick={toggle}
        style={enabled ? { color: 'var(--ember)', borderColor: 'var(--ember)' } : undefined}
      >
        {busy ? 'Guardando…' : enabled ? 'Desactivar tienda' : 'Activar tienda'}
      </Btn>
      {error && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(168,50,50,0.12)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ember)',
          maxWidth: 320,
          wordBreak: 'break-word',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
