'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'

export function CollaboratorForm() {
  const [motivation, setMotivation] = useState('')
  const [portfolio, setPortfolio]   = useState('')
  const [status, setStatus]         = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (motivation.trim().length < 20) {
      setErrorMsg('La motivación debe tener al menos 20 caracteres.')
      return
    }
    setStatus('sending')
    setErrorMsg('')

    const res = await fetch('/api/collaborator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivation: motivation.trim(), portfolio: portfolio.trim() || null }),
    })

    if (res.ok) {
      setStatus('sent')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'No se pudo enviar la solicitud.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '32px 24px', background: 'var(--bg-card)', border: '1px solid var(--spore)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--spore)', marginBottom: 12 }}>✦</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)' }}>
          Tu solicitud ha sido enviada. El autor la revisará y se pondrá en contacto contigo pronto.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <label style={{ fontFamily: 'var(--font-ui)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)', display: 'block', marginBottom: 8 }}>
          ¿Por qué quieres colaborar? <span style={{ color: 'var(--ember)' }}>*</span>
        </label>
        <textarea
          value={motivation}
          onChange={e => setMotivation(e.target.value)}
          required
          minLength={20}
          maxLength={1000}
          rows={6}
          placeholder="Cuéntanos sobre ti, qué tipo de contenido te gustaría crear y cómo encajas en el universo de ETERNIDAD..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--moss-800)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '12px 14px',
            fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)',
            lineHeight: 1.6, resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 4, textAlign: 'right' }}>
          {motivation.length} / 1000
        </div>
      </div>

      <div>
        <label style={{ fontFamily: 'var(--font-ui)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)', display: 'block', marginBottom: 8 }}>
          Portfolio o enlace de referencia <span style={{ color: 'var(--text-mute)' }}>(opcional)</span>
        </label>
        <input
          type="url"
          value={portfolio}
          onChange={e => setPortfolio(e.target.value)}
          placeholder="https://tu-portfolio.com o perfil en redes"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--moss-800)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '12px 14px',
            fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>

      {errorMsg && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)', margin: 0 }}>
          {errorMsg}
        </p>
      )}

      <div>
        <Btn type="submit" variant="rune" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
        </Btn>
      </div>
    </form>
  )
}
