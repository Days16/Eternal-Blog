import { LEVELS } from './constants'
import type { LevelNumber } from './constants'

interface LevelBadgeProps {
  level?: LevelNumber
  size?: number
  showLabel?: boolean
}

export function LevelBadge({ level = 3, size = 28, showLabel = false }: LevelBadgeProps) {
  const L = LEVELS[(level - 1) as 0 | 1 | 2 | 3 | 4] ?? LEVELS[0]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--moss-800)',
          border: `1.5px solid ${L.color}`,
          color: L.color,
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.55,
          boxShadow: `inset 0 0 ${size * 0.4}px ${L.color}33`,
          flexShrink: 0,
        }}
      >
        {L.rune}
      </span>
      {showLabel && (
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: L.color,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            fontWeight: 600,
          }}
        >
          Nv.{L.n} · {L.name}
        </span>
      )}
    </span>
  )
}
