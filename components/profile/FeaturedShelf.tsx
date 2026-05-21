import Link from 'next/link'

interface FeaturedEntry {
  position: number
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  publishedAt: Date | null
  type: 'chronicle' | 'codex'
}

interface FeaturedShelfProps {
  entries: FeaturedEntry[]
}

export function FeaturedShelf({ entries }: FeaturedShelfProps) {
  if (entries.length === 0) return null

  const base = (type: string) => type === 'codex' ? '/codex' : '/cronicas'

  return (
    <section style={{ marginBottom: 32, maxWidth: 900 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 600,
        color: 'var(--spore)',
        marginBottom: 16,
        letterSpacing: 0.5,
      }}>
        Lecturas recomendadas
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {entries.map(entry => (
          <Link
            key={entry.id}
            href={`${base(entry.type)}/${entry.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <article style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)',
              padding: 18,
              height: '100%',
              transition: 'border-color var(--t-fast)',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--spore)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: 2,
                color: 'var(--rune)',
                marginBottom: 8,
              }}>
                {entry.type === 'codex' ? 'Codex' : 'Crónica'}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.3,
                color: 'var(--text)',
                marginBottom: 8,
              }}>
                {entry.title}
              </div>
              {entry.excerpt && (
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--text-mute)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {entry.excerpt}
                </div>
              )}
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
