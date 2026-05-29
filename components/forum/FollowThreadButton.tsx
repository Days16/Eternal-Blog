'use client'

import { useState, useTransition } from 'react'
import { toggleFollowThreadAction } from '@/app/foro/actions'
import { Btn } from '@/components/ui/Btn'

interface FollowThreadButtonProps {
  threadId: string
  initialFollowing: boolean
}

export function FollowThreadButton({ threadId, initialFollowing }: FollowThreadButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    if (isPending) return
    const nextState = !following
    setFollowing(nextState)
    startTransition(async () => {
      try {
        await toggleFollowThreadAction(threadId, nextState)
      } catch (err) {
        console.error('[forum] Failed to toggle thread follow:', err)
        // Revert state if failed
        setFollowing(!nextState)
      }
    })
  }

  return (
    <Btn
      type="button"
      variant={following ? 'primary' : 'rune'}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      style={{
        padding: '5px 12px',
        fontSize: 11,
        borderRadius: 'var(--r-md)',
        background: following ? 'color-mix(in srgb, var(--spore) 12%, transparent)' : 'transparent',
        color: following ? 'var(--spore)' : 'var(--text-soft)',
        borderColor: following ? 'var(--spore)' : 'var(--border)',
        fontWeight: following ? 600 : 400,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}
    >
      {following ? '✦ Siguiendo' : '⊙ Seguir'}
    </Btn>
  )
}
