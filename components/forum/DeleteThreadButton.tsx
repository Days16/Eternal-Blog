'use client'

import { deleteThreadAction } from '@/app/foro/actions'

interface Props {
  threadId: string
  categorySlug: string
}

export function DeleteThreadButton({ threadId, categorySlug }: Props) {
  return (
    <form action={deleteThreadAction} style={{ display: 'inline' }}>
      <input type="hidden" name="thread_id" value={threadId} />
      <input type="hidden" name="category_slug" value={categorySlug} />
      <button
        type="submit"
        onClick={e => { if (!confirm('¿Eliminar este hilo?')) e.preventDefault() }}
        style={{
          padding: '5px 12px',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          background: 'transparent',
          fontFamily: 'var(--font-ui)', fontSize: 11,
          color: 'var(--ember)', cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Eliminar
      </button>
    </form>
  )
}
