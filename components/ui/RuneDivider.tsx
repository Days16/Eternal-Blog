interface RuneDividerProps {
  char?: string
  color?: string
}

export function RuneDivider({ char = '✦', color = 'var(--rune)' }: RuneDividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color, opacity: 0.5 }}>
      <div style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.4 }} />
      <span style={{ fontSize: 12, fontFamily: 'var(--font-display)' }}>{char}</span>
      <div style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.4 }} />
    </div>
  )
}
