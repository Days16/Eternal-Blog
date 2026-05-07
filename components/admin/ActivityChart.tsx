const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 96 }}>
        {data.map((d, i) => {
          const heightPct = Math.max((d.count / max) * 100, 5)
          const isWeekend = (() => {
            const day = new Date(d.date + 'T12:00:00').getDay()
            return day === 0 || day === 6
          })()
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count}`}
              style={{
                flex: 1,
                height: `${heightPct}%`,
                background: isWeekend ? 'var(--rune)' : 'var(--spore)',
                borderRadius: '3px 3px 0 0',
                opacity: 0.65 + (i / data.length) * 0.35,
                transition: 'opacity 0.15s',
                cursor: 'default',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {data.map(d => {
          const dayIndex = new Date(d.date + 'T12:00:00').getDay()
          return (
            <div
              key={d.date}
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                color: 'var(--text-mute)',
                letterSpacing: 0.3,
              }}
            >
              {DAY_LABELS[dayIndex]}
            </div>
          )
        })}
      </div>
    </div>
  )
}
