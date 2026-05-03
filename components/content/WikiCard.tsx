import Link from 'next/link'
import { Tag } from '@/components/ui/Tag'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { CODEX_CATEGORIES } from '@/lib/supabase/queries/entries'
import { formatWords, relativeTime } from '@/lib/utils/dates'

interface WikiCardProps {
  entry: {
    slug: string
    title: string
    category: string | null
    wordCount: number
    updatedAt: Date | number | null
  }
}

export function WikiCard({ entry }: WikiCardProps) {
  const cat = CODEX_CATEGORIES.find(c => c.id === entry.category)

  return (
    <Link href={`/codex/${entry.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-soft)',
          cursor: 'pointer',
          transition: 'transform var(--t-fast) var(--ease)',
        }}
      >
        <ImagePlaceholder height={180} tone="forest" label={cat?.name.toLowerCase() ?? 'codex'} />
        <div style={{ padding: 20 }}>
          {cat && <Tag color={cat.color}>{cat.name}</Tag>}
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              margin: '12px 0 8px',
              letterSpacing: -0.3,
              lineHeight: 1.2,
              color: 'var(--text)',
            }}
          >
            {entry.title}
          </h4>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-mute)',
            }}
          >
            <span>{formatWords(entry.wordCount)} palabras</span>
            <span>{relativeTime(entry.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
