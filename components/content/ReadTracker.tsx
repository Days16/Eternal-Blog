'use client'

import { useEffect, useRef } from 'react'

type ReadTrackerProps = {
  entryId: string
  enabled: boolean
}

export function ReadTracker({ entryId, enabled }: ReadTrackerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (firedRef.current) return
        if (entries.some(e => e.isIntersecting)) {
          firedRef.current = true
          fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entryId }),
          }).catch(() => {})
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [entryId, enabled])

  return <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
}
