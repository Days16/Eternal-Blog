'use client'

import { deleteRoadmapItemAction, toggleRoadmapItemPublicAction } from '@/app/admin/roadmap/actions'

export function RoadmapDeleteButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteRoadmapItemAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={e => {
          if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) e.preventDefault()
        }}
        style={{
          padding: '5px 10px',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          background: 'none',
          color: 'var(--ember)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </form>
  )
}

export function RoadmapTogglePublicButton({ id, isPublic }: { id: string; isPublic: boolean }) {
  return (
    <form action={toggleRoadmapItemPublicAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="public" value={String(isPublic)} />
      <button
        type="submit"
        title={isPublic ? 'Ocultar al público' : 'Publicar'}
        style={{
          padding: '5px 10px',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-sm)',
          background: 'none',
          color: isPublic ? 'var(--spore)' : 'var(--text-mute)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {isPublic ? '●' : '○'}
      </button>
    </form>
  )
}
