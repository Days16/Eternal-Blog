interface LeafProps {
  size?: number
  rotate?: number
  color?: string
}

export function Leaf({ size = 14, rotate = 0, color = 'var(--moss-400)' }: LeafProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)`, flexShrink: 0 }}
    >
      <path
        d="M12 2C7 2 3 6 3 12c0 5 4 9 9 10 0-5 0-10 0-15 0 0 4 5 4 10 3-2 5-5 5-9 0-3-3-6-9-6z"
        fill={color}
        opacity=".8"
      />
      <path d="M12 22V7" stroke="var(--moss-900)" strokeWidth="0.5" opacity=".4" />
    </svg>
  )
}
