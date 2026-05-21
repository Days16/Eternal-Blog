'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'

export function CollaboratorReviewButtons({ appId }: { appId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function review(status: 'accepted' | 'rejected') {
    if (busy) return
    setBusy(true)
    await fetch('/api/collaborator', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, status }),
    })
    setBusy(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Btn
        type="button"
        variant="rune"
        size="sm"
        disabled={busy}
        onClick={() => review('accepted')}
      >
        Aceptar
      </Btn>
      <Btn
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy}
        style={{ color: 'var(--ember)', borderColor: 'var(--ember)' }}
        onClick={() => review('rejected')}
      >
        Rechazar
      </Btn>
    </div>
  )
}
