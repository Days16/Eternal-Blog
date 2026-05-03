'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import { AchievementToast } from '@/components/gamification/AchievementToast'
import { EasterEggClient } from '@/components/gamification/EasterEggClient'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={30}>
      {children}
      <EasterEggClient />
      <AchievementToast />
    </SessionProvider>
  )
}
