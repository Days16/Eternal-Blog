import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react'

type BtnVariant = 'primary' | 'ghost' | 'rune' | 'bare'
type BtnSize = 'sm' | 'md' | 'lg'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  icon?: ReactNode
  style?: CSSProperties
}

const SIZES: Record<BtnSize, CSSProperties> = {
  sm: { padding: '6px 12px',  fontSize: 12, borderRadius: 'var(--r-sm)' },
  md: { padding: '10px 18px', fontSize: 13, borderRadius: 'var(--r-md)' },
  lg: { padding: '14px 24px', fontSize: 14, borderRadius: 'var(--r-md)' },
}

const VARIANTS: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: 'var(--spore)',
    color: 'var(--accent-ink)',
    boxShadow: 'var(--glow-spore)',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  rune: {
    background: 'transparent',
    color: 'var(--rune)',
    border: '1px solid var(--rune-dim)',
  },
  bare: {
    background: 'transparent',
    color: 'var(--text-soft)',
    border: 'none',
  },
}

const BASE: CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all var(--t-fast) var(--ease)',
  letterSpacing: 0.2,
  whiteSpace: 'nowrap',
}

export function Btn({ children, variant = 'primary', size = 'md', icon, style, ...rest }: BtnProps) {
  return (
    <button style={{ ...BASE, ...SIZES[size], ...VARIANTS[variant], ...style }} {...rest}>
      {icon}
      {children}
    </button>
  )
}
