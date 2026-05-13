'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction } from '@/app/(auth)/actions'
import { Mushroom } from '@/components/ui/Mushroom'

export default function OlvideConjuroPage() {
  const [result, formAction, isPending] = useActionState(requestPasswordResetAction, null)
  const sent = result === null && !isPending

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <Mushroom size={20} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, letterSpacing: 4, color: 'var(--text)' }}>
            ETERNIDAD
          </span>
        </Link>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--spore)', marginBottom: 12 }}>
          ✦ recuperar acceso
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, margin: '0 0 10px', letterSpacing: -0.5 }}>
          ¿Olvidaste el conjuro?
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 32 }}>
          Escribe tu sello de correo y te enviaremos un nuevo conjuro para recuperar el acceso.
        </p>

        {sent ? (
          <div style={{ padding: '20px 24px', background: 'rgba(212,166,74,0.08)', border: '1px solid var(--spore)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--spore)', marginBottom: 8, fontWeight: 600 }}>
              ✦ Conjuro enviado
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-soft)', margin: 0, lineHeight: 1.55 }}>
              Si existe una cuenta con ese correo, recibirás el enlace en breve. Revisa también tu carpeta de correo no deseado.
            </p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: 16, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--mist)', textDecoration: 'none' }}>
              ← Volver al portal
            </Link>
          </div>
        ) : (
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                Sello (correo)
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@reino.com"
                style={{ width: '100%', padding: '13px 16px', background: 'var(--moss-800)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {typeof result === 'string' && (
              <div style={{ padding: '10px 14px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)' }}>
                {result}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{ padding: 14, background: isPending ? 'var(--moss-700)' : 'var(--spore)', color: 'var(--accent-ink)', border: 'none', borderRadius: 'var(--r-md)', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}
            >
              {isPending ? 'Enviando conjuro…' : 'Enviar enlace de recuperación'}
            </button>

            <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)' }}>
              <Link href="/login" style={{ color: 'var(--mist)', textDecoration: 'none' }}>← Volver al portal</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
