export function KPICard({ label, value, color = 'var(--spore)' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 22 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color, fontWeight: 600 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</div>
    </div>
  )
}
