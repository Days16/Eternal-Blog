'use client'

import { signOut } from 'next-auth/react'
import { Btn } from '@/components/ui/Btn'

export function ProfileSignOutButton() {
  return (
    <Btn
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{ color: 'var(--ember)', borderColor: 'var(--ember)' }}
    >
      Cerrar sesión
    </Btn>
  )
}
