'use client'

import { deleteAchievementAction } from '@/app/admin/actions'

export function DeleteAchievementButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteAchievementAction} style={{ flex: 1 }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={e => {
          if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) e.preventDefault()
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
