'use client'
import { createContext, useContext } from 'react'
import type { AppSession } from '@/lib/auth/session'

const SessionCtx = createContext<AppSession | null>(null)

export function SessionProvider({ session, children }: { session: AppSession | null; children: React.ReactNode }) {
  return <SessionCtx.Provider value={session}>{children}</SessionCtx.Provider>
}

export function useAppSession() {
  return useContext(SessionCtx)
}
