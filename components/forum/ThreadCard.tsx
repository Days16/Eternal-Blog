import Link from 'next/link'
import { relativeTime } from '@/lib/utils/dates'
import type { ForumThread } from '@/lib/supabase/queries/forum'

interface Props {
  thread: ForumThread
  categorySlug: string
}

export function ThreadCard({ thread, categorySlug }: Props) {
  return (
    <Link
      href={`/foro/${categorySlug}/${thread.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
        alignItems: 'center',
        transition: 'border-color 0.15s',
      }}
      className="hover-row"
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {thread.pinned && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--spore)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                border: '1px solid var(--spore)',
                borderRadius: 4,
                padding: '1px 5px',
                flexShrink: 0,
              }}>
                Fijado
              </span>
            )}
            {thread.locked && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--text-mute)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '1px 5px',
                flexShrink: 0,
              }}>
                Cerrado
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--text)',
              fontWeight: 500,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              {thread.title}
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: 'var(--text-mute)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>{thread.author?.name ?? thread.author?.username ?? 'Anónimo'}</span>
            <span>·</span>
            <span>{relativeTime(thread.createdAt)}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-soft)',
          }}>
            {thread.replyCount ?? 0}
          </div>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            resp.
          </div>
        </div>
      </div>
    </Link>
  )
}
