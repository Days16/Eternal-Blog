export default function CronicasLoading() {
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

      {/* Skeleton hero */}
      <section className="page-hero">
        <div className="skeleton" style={{ width: 220, height: 13, marginBottom: 20, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: '58%', height: 68, marginBottom: 16, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '40%', height: 28, marginBottom: 16, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: '48%', height: 18, borderRadius: 4 }} />
      </section>

      {/* Main grid */}
      <div className="main-flex page-layout">

        {/* Feed skeleton */}
        <main className="page-main">
          <div className="skeleton" style={{ width: '100%', height: 1, marginBottom: 32, borderRadius: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
            {[1, 2, 3].map(i => (
              <article key={i} className="entry-card" style={{ paddingBottom: 32, borderBottom: i < 3 ? '1px solid var(--border-soft)' : 'none' }}>
                {/* Image placeholder */}
                <div className="skeleton" style={{ height: 140, borderRadius: 'var(--r-md)' }} />
                {/* Text content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 56, height: 20, borderRadius: 99 }} />
                    <div className="skeleton" style={{ width: 72, height: 12, borderRadius: 3 }} />
                    <div className="skeleton" style={{ width: 48, height: 12, borderRadius: 3 }} />
                  </div>
                  <div className="skeleton" style={{ width: '82%', height: 28, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: '65%', height: 22, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: '95%', height: 13, borderRadius: 3 }} />
                  <div className="skeleton" style={{ width: '78%', height: 13, borderRadius: 3 }} />
                  <div className="skeleton" style={{ width: 120, height: 13, borderRadius: 3 }} />
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar skeleton */}
        <aside className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Grimorio widget */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: 24,
          }}>
            <div className="skeleton" style={{ width: 148, height: 11, marginBottom: 18, borderRadius: 3 }} />
            <div className="skeleton" style={{ width: '78%', height: 26, marginBottom: 8, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: '55%', height: 13, marginBottom: 20, borderRadius: 3 }} />
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ width: 90, height: 10, borderRadius: 3 }} />
              <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 3 }} />
            </div>
            <div style={{ height: 6, background: 'var(--moss-900)', borderRadius: 99, overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '42%', height: '100%', borderRadius: 99 }} />
            </div>
          </div>

          {/* Top readers widget */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: 24,
          }}>
            <div className="skeleton" style={{ width: 160, height: 11, marginBottom: 16, borderRadius: 3 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <div className="skeleton" style={{ width: 16, height: 12, borderRadius: 3, flexShrink: 0 }} />
                <div className="skeleton" style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '68%', height: 12, borderRadius: 3 }} />
                </div>
                <div className="skeleton" style={{ width: 38, height: 10, borderRadius: 3 }} />
              </div>
            ))}
          </div>

        </aside>
      </div>
    </div>
  )
}
