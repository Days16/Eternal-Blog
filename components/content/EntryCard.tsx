import Link from 'next/link'
import { Tag } from '@/components/ui/Tag'
import { Mushroom } from '@/components/ui/Mushroom'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { formatDate, readingTime } from '@/lib/utils/dates'

interface EntryCardProps {
  entry: {
    slug: string
    title: string
    excerpt: string | null
    tags: string
    publishedAt: Date | number | null
    wordCount: number
  }
  index?: number
  isLast?: boolean
}

const TAG_COLORS: Record<string, string> = {
  worldbuilding: 'var(--mist)',
  craft:         'var(--rune)',
  guía:          'var(--rune)',
  preview:       'var(--spore)',
  diario:        'var(--moss-300)',
  ficción:       'var(--spore)',
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag.toLowerCase()] ?? 'var(--moss-300)'
}

const IMG_TONES = ['forest', 'mist', 'ember', 'sky'] as const

export function EntryCard({ entry, index = 0, isLast = false }: EntryCardProps) {
  const tags: string[] = (() => { try { return JSON.parse(entry.tags) } catch { return [] } })()
  const firstTag  = tags[0] ?? ''
  const tagColor  = getTagColor(firstTag)
  const xpReward  = Math.max(10, Math.ceil(entry.wordCount / 100))
  const tone      = IMG_TONES[index % IMG_TONES.length]

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 32,
        paddingBottom: 32,
        borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
      }}
    >
      <Link href={`/cronicas/${entry.slug}`} style={{ display: 'block' }}>
        <ImagePlaceholder height={140} tone={tone} label={firstTag || 'crónica'} />
      </Link>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          {firstTag && <Tag color={tagColor}>{firstTag}</Tag>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
            {formatDate(entry.publishedAt)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
            · {readingTime(entry.wordCount)}
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--spore)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mushroom size={10} /> +{xpReward} XP
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 10px',
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          <Link href={`/cronicas/${entry.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {entry.title}
          </Link>
        </h2>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', lineHeight: 1.55, margin: 0 }}>
          {entry.excerpt}
        </p>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
          <Link
            href={`/cronicas/${entry.slug}`}
            style={{ color: 'var(--spore)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Continuar leyendo →
          </Link>
        </div>
      </div>
    </article>
  )
}
