import { LoginForm } from '@/components/auth/LoginForm'
import { getUserCount } from '@/lib/supabase/queries/users'

export default async function LoginPage() {
  const userCount = await getUserCount()
  return <LoginForm userCount={userCount} />
}
