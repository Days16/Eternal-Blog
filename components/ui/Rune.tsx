import { RUNES } from './constants'

interface RuneProps {
  char?: string
  size?: number
  opacity?: number
}

export function Rune({ char, size = 14, opacity = 0.4 }: RuneProps) {
  const glyph = char ?? RUNES[Math.floor(Math.random() * RUNES.length)]
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: size,
        color: 'var(--rune)',
        opacity,
        fontFeatureSettings: '"smcp"',
        letterSpacing: 1,
      }}
    >
      {glyph}
    </span>
  )
}
