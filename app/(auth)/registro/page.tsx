'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '../actions'
import { Mushroom } from '@/components/ui/Mushroom'
import { RUNES } from '@/components/ui/constants'

export default function RegistroPage() {
  const [error, formAction, isPending] = useActionState(registerAction, null)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Panel decorativo */}
      <div style={{
        flex: 1, position: 'relative',
        background: 'linear-gradient(135deg, var(--moss-800), var(--moss-950))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }}>
          {RUNES.map((r, i) => (
            <span key={i} style={{
              position: 'absolute',
              top:  `${(i * 19) % 90}%`,
              left: `${(i * 31) % 90}%`,
              fontFamily: 'var(--font-display)',
              fontSize: 24 + (i % 4) * 12,
              color: 'var(--rune)',
              transform: `rotate(${(i * 23) % 360}deg)`,
            }}>{r}</span>
          ))}
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Mushroom size={120} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, letterSpacing: 8, margin: '20px 0 10px' }}>
            ETERNIDAD
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-soft)', maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
            Crear cuenta es gratis. Recibirás un nombre de iniciado y empezarás como Aprendiz.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div style={{
        flexBasis: 480, flexShrink: 0,
        padding: '64px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--spore)', marginBottom: 14 }}>
          ✦ iniciación
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1, margin: '0 0 12px' }}>
          Une tu nombre al árbol
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 36, lineHeight: 1.5 }}>
          Cada iniciado parte desde cero. Cada XP ganado, merecido.
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Field label="Nombre de iniciado" name="username" placeholder="ej. saela_vornn" />
          <Field label="Sello (correo)" name="email" type="email" placeholder="tu@reino.com" />
          <Field label="Palabra-llave" name="password" type="password" placeholder="mínimo 8 caracteres" />

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 16px',
              background: 'rgba(168,50,50,.15)', border: '1px solid var(--ember)',
              borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '14px', marginBottom: 16,
              background: isPending ? 'var(--moss-700)' : 'var(--spore)',
              color: 'var(--accent-ink)', border: 'none',
              borderRadius: 'var(--r-md)', cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
              letterSpacing: 1, textTransform: 'uppercase',
              transition: 'background var(--t-fast)',
            }}
          >
            {isPending ? 'Sellando pacto…' : 'Sellar mi pacto'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)' }}>
          ¿Ya tienes pacto?{' '}
          <Link href="/login" style={{ color: 'var(--spore)' }}>Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, name, type = 'text', placeholder,
}: {
  label: string; name: string; type?: string; placeholder: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11,
        color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        style={{
          width: '100%', padding: '14px 16px',
          background: 'var(--moss-800)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', outline: 'none',
          fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
