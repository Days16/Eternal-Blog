export default function CodexLoading() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Skeleton nav */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: '20px 48px', gap: 32,
        borderBottom: '1px solid var(--border-soft)',
        background: 'rgba(11,17,25,0.92)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div className="skeleton" style={{ width: 140, height: 22, borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 24, marginLeft: 24 }}>
          {[80, 56, 112].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 13, borderRadius: 3 }} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 99 }} />
      </header>

      {/* Skeleton hero — centered */}
      <section className="page-hero" style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 120, height: 13, margin: '0 auto 20px', borderRadius: 3 }} />
        <div className="skeleton" style={{ width: '52%', height: 68, margin: '0 auto 16px', borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 320, height: 17, margin: '0 auto 40px', borderRadius: 4 }} />
        {/* Search bar skeleton */}
        <div className="skeleton" style={{ width: 560, maxWidth: '100%', height: 52, margin: '0 auto', borderRadius: 99 }} />
      </section>

      {/* Categories grid skeleton */}
      <section className="page-layout" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 116, borderRadius: 'var(--r-lg)' }}
            />
          ))}
        </div>
      </section>

      {/* Wiki cards skeleton */}
      <section className="page-layout" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="skeleton" style={{ width: '100%', height: 1, marginBottom: 32, borderRadius: 0 }} />
        <div className="grid-codex-featured" style={{ marginTop: 32 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                border: '1px solid var(--border-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="skeleton" style={{ width: 56, height: 16, borderRadius: 3 }} />
              <div className="skeleton" style={{ width: '80%', height: 22, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: '95%', height: 13, borderRadius: 3 }} />
              <div className="skeleton" style={{ width: '72%', height: 13, borderRadius: 3 }} />
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
