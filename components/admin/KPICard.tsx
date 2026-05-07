export function KPICard({
  label,
  value,
  color = 'var(--spore)',
  delta,
}: {
  label: string
  value: string | number
  color?: string
  delta?: number | null
}) {
  return (
    <div className="glass-card" style={{ padding: '20px 24px', borderRadius: 'var(--r-lg)' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 9,
        color: 'var(--text-mute)',
        textTransform: 'uppercase' as const,
        letterSpacing: 2,
        fontWeight: 600,
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36,
          color,
          fontWeight: 600,
          letterSpacing: -1,
          lineHeight: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString('es-ES') : value}
        </div>
        {delta != null && (
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: delta >= 0 ? '#6ab187' : 'var(--ember)',
            fontWeight: 600,
            marginBottom: 3,
            letterSpacing: 0.3,
          }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </div>
        )}
      </div>
    </div>
  )
}
