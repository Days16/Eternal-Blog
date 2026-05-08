'use client'

import { deleteRoleAction } from '@/app/admin/actions'

interface DeleteRoleButtonProps {
  id: string
  name: string
  label: string
}

export function DeleteRoleButton({ id, name, label }: DeleteRoleButtonProps) {
  return (
    <form action={deleteRoleAction} style={{ flex: 1 }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={name} />
      <button
        type="submit"
        onClick={e => {
          if (!confirm(`¿Eliminar el rol "${label}"?\n\nLos usuarios con este rol serán reasignados a Lector. Esta acción no se puede deshacer.`)) {
            e.preventDefault()
          }
        }}
        style={{
          width: '100%',
          padding: '7px 0',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          background: 'none',
          color: 'var(--ember)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Eliminar
      </button>
    </form>
  )
}
