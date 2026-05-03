import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getSession() {
  return auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

export async function requireRole(...roles: string[]) {
  const session = await requireAuth()
  const userRole = (session.user as typeof session.user & { role?: string }).role ?? 'reader'
  if (!roles.includes(userRole)) redirect('/')
  return session
}
