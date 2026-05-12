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
    <Link href={`/codex/${entry.slug}`} className="wiki-card-outer" style={{ textDecoration: 'none', display: 'block' }}>
      <div className="wiki-card">
        <div className="wiki-card-img">
          <ImagePlaceholder height={180} tone="forest" label={cat?.name.toLowerCase() ?? 'codex'} />
        </div>
        <div style={{ padding: 20 }}>
          {cat && <Tag color={cat.color}>{cat.name}</Tag>}
          <h4 className="wiki-card-title">
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
