import Link from 'next/link'
import type { ForumCategory } from '@/lib/supabase/queries/forum'

interface Props {
  category: ForumCategory
}

export function ForumCategoryCard({ category }: Props) {
  return (
    <Link
      href={`/foro/${category.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      className="hover-row"
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--r-md)',
          background: `color-mix(in srgb, ${category.color} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${category.color} 30%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
          color: category.color,
        }}>
          {category.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 4,
          }}>
            {category.name}
          </div>
          {category.description && (
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-mute)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              {category.description}
            </div>
          )}
        </div>

        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--text-mute)',
          flexShrink: 0,
          textAlign: 'right',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-soft)' }}>
            {category.threadCount ?? 0}
          </div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>hilos</div>
        </div>
      </div>
    </Link>
  )
}
