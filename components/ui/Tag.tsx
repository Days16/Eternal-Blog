import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  color?: string
}

export function Tag({ children, color = 'var(--moss-400)' }: TagProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color,
        border: `1px solid ${color}55`,
        padding: '3px 8px',
        borderRadius: 99,
        background: `${color}10`,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
