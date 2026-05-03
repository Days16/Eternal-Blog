interface MushroomProps {
  size?: number
  glow?: boolean
  color?: string
}

export function Mushroom({ size = 18, glow = true, color = 'var(--spore)' }: MushroomProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: glow ? 'drop-shadow(0 0 4px var(--spore-glow))' : 'none', flexShrink: 0 }}
    >
      <path
        d="M4 11c0-4.5 3.5-8 8-8s8 3.5 8 8c0 1-.5 1.5-1.5 1.5h-13C4.5 12.5 4 12 4 11z"
        fill={color}
        opacity=".9"
      />
      <ellipse cx="9"    cy="8"  rx="1.2" ry="1.2" fill="var(--moss-900)" opacity=".5" />
      <ellipse cx="14.5" cy="6.5" rx=".8"  ry=".8"  fill="var(--moss-900)" opacity=".5" />
      <ellipse cx="13"   cy="10" rx="1"   ry="1"   fill="var(--moss-900)" opacity=".5" />
      <path
        d="M10 12.5h4l-.5 7c0 1-.5 1.5-1.5 1.5s-1.5-.5-1.5-1.5l-.5-7z"
        fill="var(--moss-200)"
        opacity=".7"
      />
    </svg>
  )
}
