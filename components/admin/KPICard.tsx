export function KPICard({ label, value, color = 'var(--spore)' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="glass-card" style={{ padding: '24px 28px', borderRadius: 'var(--r-lg)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, color, fontWeight: 600, letterSpacing: -1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 500 }}>{label}</div>
    </div>
  )
}
