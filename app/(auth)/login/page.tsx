'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/app/(auth)/actions'
import { Mushroom } from '@/components/ui/Mushroom'
import { RUNES } from '@/components/ui/constants'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [error, formAction, isPending] = useActionState(loginAction, null)

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
            &ldquo;Cada palabra escrita a luz de hongo es una palabra que no se borra&rdquo;
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
          ✦ invocación
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1, margin: '0 0 12px' }}>
          Vuelve al bosque
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 36, lineHeight: 1.5 }}>
          Pronuncia tus credenciales y deja que las hojas se aparten.
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Field label="Sello (correo)" name="email" type="email" placeholder="tu@reino.com" />
          <Field label="Palabra-llave" name="password" type="password" placeholder="••••••••••••" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, fontFamily: 'var(--font-ui)', fontSize: 12 }}>
            <Link href="/olvide-conjuro" style={{ color: 'var(--mist)', textDecoration: 'none' }}>¿Olvidaste el conjuro?</Link>
          </div>

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
            {isPending ? 'Abriendo portal…' : 'Atravesar el portal'}
          </button>
        </form>

        <Separator />

        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)' }}>
          ¿Primera vez?{' '}
          <Link href="/registro" style={{ color: 'var(--spore)' }}>Crea tu pacto</Link>
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

function Separator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 2 }}>o</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
    </div>
  )
}
