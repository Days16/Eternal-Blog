'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'

interface FollowButtonProps {
  targetId: string
  initialFollowing: boolean
}

export function FollowButton({ targetId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (busy) return
    setBusy(true)
    const action = following ? 'unfollow' : 'follow'
    const res = await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, targetId }),
    })
    if (res.ok) setFollowing(v => !v)
    setBusy(false)
  }

  return (
    <Btn
      type="button"
      variant={following ? 'ghost' : 'rune'}
      size="sm"
      disabled={busy}
      onClick={toggle}
    >
      {following ? 'Siguiendo' : 'Seguir'}
    </Btn>
  )
}
