import { LevelBadge } from './LevelBadge'
import type { LevelNumber } from './constants'

interface UserAvatarProps {
  avatarUrl?: string | null
  level: LevelNumber
  name?: string | null
  size?: number
}

export function UserAvatar({ avatarUrl, level, name, size = 28 }: UserAvatarProps) {
  const badgeSize = Math.round(size * 0.5)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ? `Avatar de ${name}` : 'Avatar'}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid var(--border)',
          }}
        />
      ) : (
        <LevelBadge level={level} size={size} />
      )}
      {avatarUrl && (
        <span style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--bg)', borderRadius: '50%', padding: 1 }}>
          <LevelBadge level={level} size={badgeSize} />
        </span>
      )}
    </span>
  )
}
