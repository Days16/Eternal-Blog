import Link from 'next/link'

interface CategoryCardProps {
  id: string
  name: string
  rune: string
  color: string
  desc: string
  count: number
}

export function CategoryCard({ id, name, rune, color, desc, count }: CategoryCardProps) {
  return (
    <Link href={`/codex?category=${id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          padding: 28,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all var(--t-fast) var(--ease)',
          height: '100%',
        }}
      >
        {/* Runa decorativa de fondo */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            color,
            opacity: 0.15,
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {rune}
        </div>

        {/* Icono con runa */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${color}18`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            marginBottom: 16,
            border: `1px solid ${color}40`,
          }}
        >
          {rune}
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 600,
            margin: '0 0 4px',
            letterSpacing: -0.3,
            color: 'var(--text)',
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--text-mute)',
            margin: '0 0 14px',
            fontStyle: 'italic',
          }}
        >
          {desc}
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>
          {count} {count === 1 ? 'entrada' : 'entradas'} →
        </div>
      </div>
    </Link>
  )
}
