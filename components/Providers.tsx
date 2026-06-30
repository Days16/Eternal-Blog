'use client'

import type { ReactNode } from 'react'
import type { AppSession } from '@/lib/auth/session'
import { SessionProvider } from '@/components/auth/SessionContext'
import { AchievementToast } from '@/components/gamification/AchievementToast'
import { EasterEggClient } from '@/components/gamification/EasterEggClient'

export function Providers({ children, session }: { children: ReactNode; session: AppSession | null }) {
  return (
    <SessionProvider session={session}>
      {children}
      <EasterEggClient />
      <AchievementToast />
    </SessionProvider>
  )
}
