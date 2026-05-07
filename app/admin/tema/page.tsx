export default function AdminTemaPage() {
  return (
    <div className="admin-page">
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 10,
        color: 'var(--text-mute)',
        textTransform: 'uppercase',
        letterSpacing: 3,
        margin: '0 0 8px',
        fontWeight: 600,
      }}>
        Configuración
      </p>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 40,
        fontWeight: 600,
        color: 'var(--text)',
        margin: '0 0 32px',
        letterSpacing: -0.5,
      }}>
        Tema y aspecto
      </h1>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          color: 'var(--text-mute)',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Configuración de tema en construcción.
        </p>
      </div>
    </div>
  )
}
