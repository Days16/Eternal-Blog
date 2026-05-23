'use client'

import { deleteMissionAction, archiveMissionAction } from '@/app/admin/actions'

interface Props {
  missionId: string
  completionCount: number
  status: string
}

export function MissionActionButtons({ missionId, completionCount, status }: Props) {
  if (completionCount === 0) {
    return (
      <form action={deleteMissionAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={missionId} />
        <button
          type="submit"
          onClick={e => { if (!confirm('¿Eliminar esta misión? Esta acción no se puede deshacer.')) e.preventDefault() }}
          style={{
            padding: '5px 14px',
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

  return (
    <form action={archiveMissionAction} style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={missionId} />
      <button
        type="submit"
        onClick={e => { if (!confirm(status === 'expired' ? '¿Eliminar esta misión expirada?' : '¿Archivar esta misión?')) e.preventDefault() }}
        style={{
          padding: '5px 14px',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-sm)',
          background: 'none',
          color: 'var(--text-mute)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {status === 'expired' ? 'Eliminar' : 'Archivar'}
      </button>
    </form>
  )
}
