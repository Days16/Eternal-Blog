import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function ProfileRedirectPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const username = session.user.username || session.user.id
  redirect(`/perfil/${username}`)
}
