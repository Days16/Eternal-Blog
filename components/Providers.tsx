'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { ReactNode } from 'react'
import { AchievementToast } from '@/components/gamification/AchievementToast'
import { EasterEggClient } from '@/components/gamification/EasterEggClient'

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus refetchInterval={30}>
      {children}
      <EasterEggClient />
      <AchievementToast />
    </SessionProvider>
  )
}
