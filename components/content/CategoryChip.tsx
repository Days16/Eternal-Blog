import Link from 'next/link'

interface CategoryChipProps {
  id: string
  name: string
  rune: string
  color: string
  count: number
  active?: boolean
}

export function CategoryChip({ id, name, rune, color, count, active }: CategoryChipProps) {
  return (
    <Link
      href={active ? '/codex' : `/codex?category=${id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 14px',
        borderRadius: 99,
        border: `1px solid ${active ? color : 'var(--border-soft)'}`,
        background: active ? `color-mix(in srgb, ${color} 12%, var(--bg-card))` : 'var(--bg-card)',
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color, lineHeight: 1 }}>{rune}</span>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: active ? 600 : 500, color: active ? color : 'var(--text-soft)', letterSpacing: 0.2 }}>
        {name}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginLeft: 2 }}>
        {count}
      </span>
    </Link>
  )
}
