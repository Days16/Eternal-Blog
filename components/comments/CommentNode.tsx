'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { UserNameBadge } from '@/components/ui/UserNameBadge'
import { relativeTime } from '@/lib/utils/dates'
import { sanitizeForDisplay } from '@/lib/utils/sanitize'
import { CommentForm } from './CommentForm'
import type { CommentTreeNode } from '@/lib/supabase/queries/comments'
import type { LevelNumber } from '@/components/ui/constants'

type CommentNodeProps = {
  comment: CommentTreeNode
  entryId: string
  currentUserId?: string | null
  currentUserRole?: string | null
}

function canModerate(role?: string | null) {
  return role === 'admin' || role === 'moderator' || role === 'dev'
}

export function CommentNode({ comment, entryId, currentUserId, currentUserRole }: CommentNodeProps) {
  const router = useRouter()
  const [replying, setReplying] = useState(false)
  const [expanded, setExpanded] = useState(comment.depth < 3)
  const [busy, setBusy] = useState(false)
  const isAuthor = currentUserId === comment.userId
  const moderator = canModerate(currentUserRole)
  const hiddenBody = comment.deleted || comment.sealed

  if (comment.deleted && !moderator) return null

  async function mutate(method: 'DELETE' | 'PATCH', options?: { currentState?: boolean, hard?: boolean }) {
    if (busy) return
    const body = method === 'PATCH' ? JSON.stringify({ sealed: options?.currentState }) : undefined
    const url = `/api/comments/${comment.id}${options?.hard ? '?hard=true' : ''}`
    setBusy(true)
    await fetch(url, { 
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body 
    })
    setBusy(false)
    router.refresh()
  }

  return (
    <div style={{ marginLeft: comment.depth > 0 ? Math.min(comment.depth, 4) * 18 : 0, marginTop: 16 }}>
      <article style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 18, opacity: comment.deleted ? 0.72 : 1 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--moss-700)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', color: 'var(--rune)' }}>
            {(comment.author.name ?? comment.author.username ?? 'A').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <UserNameBadge
                name={comment.author.name ?? comment.author.username ?? 'Anónimo'}
                badgeIcon={(comment.author as { activeBadgeIcon?: string | null }).activeBadgeIcon}
                badgeName={(comment.author as { activeBadgeName?: string | null }).activeBadgeName}
                size="sm"
              />
              <LevelBadge level={(comment.author.level ?? 1) as LevelNumber} size={20} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--rune)', textTransform: 'uppercase' }}>{comment.author.role}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>{relativeTime(comment.createdAt)}</div>
          </div>
        </header>

        {comment.deleted && (
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: 0 }}>Este mensaje fue borrado por el autor.</p>
        )}
        {!comment.deleted && comment.sealed && (
          <p style={{ color: 'var(--rune)', fontFamily: 'var(--font-body)', fontStyle: 'italic', margin: 0 }}>Mensaje sellado por un moderador.</p>
        )}
        {!hiddenBody && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65, color: 'var(--text-soft)' }} dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(comment.body) }} />
        )}

        <footer style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {currentUserId && !hiddenBody && <Btn type="button" variant="bare" size="sm" onClick={() => setReplying(value => !value)}>Responder</Btn>}
          {!comment.deleted && <Btn type="button" variant="bare" size="sm">Denunciar</Btn>}
          
          {moderator && (
            <div style={{ display: 'flex', gap: 6, paddingLeft: 8, borderLeft: '1px solid var(--border-soft)', marginLeft: 'auto' }}>
              {comment.deleted && (
                <Btn 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  style={{ color: 'var(--ember)', borderColor: 'var(--ember)', fontSize: 10, height: 24, padding: '0 8px', background: 'var(--ember-dim)' }} 
                  onClick={() => confirm('¿BORRAR DE LA BASE DE DATOS? Esta acción es irreversible.') && mutate('DELETE', { hard: true })} 
                  disabled={busy}
                >
                  PURGAR
                </Btn>
              )}
              {!comment.deleted && (
                <Btn 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  style={{ color: 'var(--ember)', borderColor: 'var(--ember)', fontSize: 10, height: 24, padding: '0 8px' }} 
                  onClick={() => confirm('¿Eliminar comentario?') && mutate('DELETE')} 
                  disabled={busy}
                >
                  ELIMINAR
                </Btn>
              )}
              {!comment.deleted && (
                <Btn 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  style={{ color: 'var(--amethyst)', borderColor: 'var(--amethyst)', fontSize: 10, height: 24, padding: '0 8px' }} 
                  onClick={() => mutate('PATCH', { currentState: comment.sealed })} 
                  disabled={busy}
                >
                  {comment.sealed ? 'DESELLAR' : 'SELLAR'}
                </Btn>
              )}
            </div>
          )}

          {isAuthor && !moderator && !comment.deleted && (
            <Btn 
              type="button" 
              variant="bare" 
              size="sm" 
              style={{ color: 'var(--ember)', marginLeft: 'auto' }} 
              onClick={() => confirm('¿Eliminar tu comentario?') && mutate('DELETE')} 
              disabled={busy}
            >
              Eliminar
            </Btn>
          )}
        </footer>

        {replying && (
          <div style={{ marginTop: 14 }}>
            <CommentForm entryId={entryId} parentId={comment.id} compact onCancel={() => setReplying(false)} onCreated={() => setReplying(false)} />
          </div>
        )}
      </article>

      {comment.replies.length > 0 && !expanded && (
        <button type="button" onClick={() => setExpanded(true)} style={{ marginTop: 10, marginLeft: 18, background: 'transparent', border: 'none', color: 'var(--spore)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
          Ver más respuestas ({comment.replies.length})
        </button>
      )}

      {expanded && comment.replies.map(reply => (
        <CommentNode key={reply.id} comment={reply} entryId={entryId} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      ))}
    </div>
  )
}
