'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted'

interface FriendButtonProps {
  targetId: string
  friendshipId?: string | null
  initialStatus: FriendStatus
}

const LABELS: Record<FriendStatus, string> = {
  none:             'Añadir amigo',
  pending_sent:     'Solicitud enviada ✕',
  pending_received: 'Aceptar amistad',
  accepted:         'Amigos',
}

export function FriendButton({ targetId, friendshipId, initialStatus }: FriendButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const fsId = friendshipId ?? null
  const [busy, setBusy]     = useState(false)
  const router = useRouter()

  async function act() {
    if (busy) return
    setBusy(true)

    if (status === 'none') {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_request', targetId }),
      })
      if (res.ok) setStatus('pending_sent')
    } else if (status === 'pending_sent') {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_cancel', targetId }),
      })
      if (res.ok) setStatus('none')
    } else if (status === 'pending_received' && fsId) {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'friend_respond', friendshipId: fsId, status: 'accepted' }),
      })
      if (res.ok) { setStatus('accepted'); router.refresh() }
    }

    setBusy(false)
  }

  return (
    <Btn
      type="button"
      variant={status === 'accepted' ? 'ghost' : 'rune'}
      size="sm"
      disabled={busy || status === 'accepted'}
      onClick={act}
      style={status === 'pending_received' ? { background: 'var(--mist)', color: 'var(--moss-900)', borderColor: 'var(--mist)' } : undefined}
    >
      {LABELS[status]}
    </Btn>
  )
}
