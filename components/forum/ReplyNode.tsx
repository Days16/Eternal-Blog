'use client'

import { useState } from 'react'
import { relativeTime } from '@/lib/utils/dates'
import { sanitizeForDisplay } from '@/lib/utils/sanitize'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { ReplyForm } from './ReplyForm'
import { deleteReplyAction } from '@/app/foro/actions'
import type { ForumReply } from '@/lib/supabase/queries/forum'
import type { LevelNumber } from '@/components/ui/constants'

interface Props {
  reply: ForumReply
  categorySlug: string
  threadSlug: string
  threadId: string
  currentUserId?: string | null
  canModerate?: boolean
  depth?: number
}

export function ReplyNode({
  reply,
  categorySlug,
  threadSlug,
  threadId,
  currentUserId,
  canModerate = false,
  depth = 0,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  if (reply.deleted) {
    return (
      <div style={{ paddingLeft: depth > 0 ? 24 : 0 }}>
        <div style={{
          padding: '12px 0',
          borderLeft: depth > 0 ? '2px solid var(--border-soft)' : 'none',
          paddingLeft: depth > 0 ? 16 : 0,
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic' }}>
            [Mensaje eliminado]
          </p>
          {(reply.replies ?? []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              {(reply.replies ?? []).map(child => (
                <ReplyNode
                  key={child.id}
                  reply={child}
                  categorySlug={categorySlug}
                  threadSlug={threadSlug}
                  threadId={threadId}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const canDelete = canModerate || currentUserId === reply.userId
  const isNested = depth > 0

  return (
    <div style={{ paddingLeft: isNested ? 24 : 0 }}>
      <div style={{
        borderLeft: isNested ? '2px solid var(--border-soft)' : 'none',
        paddingLeft: isNested ? 16 : 0,
        paddingTop: 12,
        paddingBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <LevelBadge level={(reply.author?.level ?? 1) as LevelNumber} size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {reply.author?.name ?? reply.author?.username ?? 'Anónimo'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                {relativeTime(reply.createdAt)}
              </span>
            </div>

            <div
              style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', lineHeight: 1.65 }}
              dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(reply.body) }}
            />

            <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center' }}>
              {currentUserId && depth < 3 && (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(v => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-mute)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    letterSpacing: 0.5,
                    padding: 0,
                  }}
                >
                  {showReplyForm ? 'Cancelar' : '↩ Responder'}
                </button>
              )}
              {canDelete && (
                <form action={deleteReplyAction}>
                  <input type="hidden" name="reply_id" value={reply.id} />
                  <input type="hidden" name="category_slug" value={categorySlug} />
                  <input type="hidden" name="thread_slug" value={threadSlug} />
                  <button
                    type="submit"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-mute)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      letterSpacing: 0.5,
                      padding: 0,
                    }}
                    onClick={e => {
                      if (!confirm('¿Eliminar esta respuesta?')) e.preventDefault()
                    }}
                  >
                    Eliminar
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && (
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <ReplyForm
              threadId={threadId}
              categorySlug={categorySlug}
              threadSlug={threadSlug}
              parentId={reply.id}
              onCancel={() => setShowReplyForm(false)}
              compact
            />
          </div>
        )}

        {(reply.replies ?? []).length > 0 && (
          <div style={{ marginTop: 4 }}>
            {(reply.replies ?? []).map(child => (
              <ReplyNode
                key={child.id}
                reply={child}
                categorySlug={categorySlug}
                threadSlug={threadSlug}
                threadId={threadId}
                currentUserId={currentUserId}
                canModerate={canModerate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
