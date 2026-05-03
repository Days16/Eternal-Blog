import { signOutAction } from '@/app/(auth)/actions'
import { Btn } from '@/components/ui/Btn'

export function ProfileSignOutButton() {
  return (
    <form action={signOutAction}>
      <Btn
        type="submit"
        variant="ghost"
        size="sm"
        style={{ color: 'var(--ember)', borderColor: 'var(--ember)' }}
      >
        Cerrar sesión
      </Btn>
    </form>
  )
}
