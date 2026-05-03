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
  forest: ['var(--moss-700)', 'var(--moss-800)'],
  mist:   ['var(--moss-600)', 'var(--moss-700)'],
  ember:  ['#3a1f1a',         '#1f110c'],
  sky:    ['#1a2638',         '#0f1820'],
}

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
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: `${(i * 37) % 90 + 5}%`,
              left: `${(i * 53) % 90 + 5}%`,
              color: 'var(--rune)',
              fontSize: 14 + (i % 3) * 6,
              fontFamily: 'var(--font-display)',
            }}
          >
            {RUNES[i % RUNES.length]}
          </span>
        ))}
      </div>
      {/* esporas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: `${(i * 41) % 80 + 10}%`,
              left: `${(i * 67) % 80 + 10}%`,
              width: 3 + (i % 3) * 2,
              height: 3 + (i % 3) * 2,
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
