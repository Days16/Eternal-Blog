'use client'
import { useAppSession } from '@/components/auth/SessionContext'

export function useAuth() {
  return useAppSession()
}
