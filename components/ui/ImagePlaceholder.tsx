import type { ReactNode, CSSProperties } from 'react'
import { RUNES } from './constants'

type Tone = 'forest' | 'mist' | 'ember' | 'sky'

interface ImagePlaceholderProps {
  width?: string | number
  height?: number
  label?: string
  tone?: Tone
  children?: ReactNode
  style?: CSSProperties
}

const TONES: Record<Tone, [string, string]> = {
  forest: ['var(--moss-700)',  'var(--moss-800)'],
  mist:   ['var(--moss-600)',  'var(--moss-700)'],
  ember:  ['var(--ember-800)', 'var(--ember-900)'],
  sky:    ['var(--moss-700)',  'var(--moss-800)'],
}

const RUNE_SPRITES = Array.from({ length: 8 }, (_, i) => ({
  top:      `${(i * 37) % 90 + 5}%`,
  left:     `${(i * 53) % 90 + 5}%`,
  fontSize: 14 + (i % 3) * 6,
  rune:     RUNES[i % RUNES.length],
}))

const SPORE_SPRITES = Array.from({ length: 5 }, (_, i) => ({
  top:  `${(i * 41) % 80 + 10}%`,
  left: `${(i * 67) % 80 + 10}%`,
  size: 3 + (i % 3) * 2,
}))

export function ImagePlaceholder({
  width = '100%',
  height = 200,
  label = 'imagen',
  tone = 'forest',
  children,
  style,
}: ImagePlaceholderProps) {
  const [a, b] = TONES[tone]
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        borderRadius: 'var(--r-md)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-soft)',
        ...style,
      }}
    >
      {/* runas dispersas */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        {RUNE_SPRITES.map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              color: 'var(--rune)',
              fontSize: s.fontSize,
              fontFamily: 'var(--font-display)',
            }}
          >
            {s.rune}
          </span>
        ))}
      </div>
      {/* esporas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {SPORE_SPRITES.map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: 'var(--spore)',
              boxShadow: '0 0 8px var(--spore-glow)',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
      {children ?? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--moss-300)',
            opacity: 0.6,
            letterSpacing: 1,
            textTransform: 'lowercase',
            padding: '4px 10px',
            border: '1px dashed var(--moss-500)',
            borderRadius: 'var(--r-sm)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
