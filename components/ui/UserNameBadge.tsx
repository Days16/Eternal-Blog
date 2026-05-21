interface UserNameBadgeProps {
  name: string
  badgeIcon?: string | null
  badgeName?: string | null
  size?: 'sm' | 'md'
}

export function UserNameBadge({ name, badgeIcon, badgeName, size = 'md' }: UserNameBadgeProps) {
  const iconSize  = size === 'sm' ? 14 : 18
  const circleSize = size === 'sm' ? 22 : 30

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? 5 : 8 }}>
      <span>{name}</span>
      {badgeIcon && (
        <span
          title={badgeName ?? 'Insignia'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width:  circleSize,
            height: circleSize,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'radial-gradient(circle at 35% 35%, rgba(212,166,74,0.25), rgba(212,166,74,0.08))',
            border: '1px solid rgba(212,166,74,0.55)',
            boxShadow: '0 0 10px rgba(212,166,74,0.35), inset 0 0 6px rgba(212,166,74,0.1)',
            fontSize: iconSize,
            lineHeight: 1,
            cursor: 'default',
            verticalAlign: 'middle',
          }}
        >
          {badgeIcon}
        </span>
      )}
    </span>
  )
}

/** Chip de badge para la fila de tags del perfil público */
export function BadgeChip({ icon, name }: { icon: string; name: string }) {
  return (
    <span
      title={name}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px 3px 6px',
        borderRadius: 99,
        border: '1px solid rgba(212,166,74,0.5)',
        background: 'radial-gradient(ellipse at top left, rgba(212,166,74,0.15), rgba(212,166,74,0.04))',
        boxShadow: '0 0 12px rgba(212,166,74,0.2)',
        fontFamily: 'var(--font-ui)',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--spore)',
        letterSpacing: 0.5,
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'rgba(212,166,74,0.18)',
        border: '1px solid rgba(212,166,74,0.4)',
        fontSize: 13,
        lineHeight: 1,
      }}>
        {icon}
      </span>
      {name}
    </span>
  )
}
