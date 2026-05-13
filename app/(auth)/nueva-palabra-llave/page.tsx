'use client'

import { useActionState, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { resetPasswordAction } from '@/app/(auth)/actions'
import { Mushroom } from '@/components/ui/Mushroom'
import Link from 'next/link'

export default function NuevaPalabraLlavePage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  )
}

function ResetContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [done, setDone] = useState(false)

  // Supabase incluye los tokens en el hash de la URL; los leemos en cliente
  const [tokens, setTokens] = useState({ access_token: '', refresh_token: '' })

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const access  = params.get('access_token')  ?? searchParams.get('access_token')  ?? ''
    const refresh = params.get('refresh_token') ?? searchParams.get('refresh_token') ?? ''
    setTokens({ access_token: access, refresh_token: refresh })
  }, [searchParams])

  const [error, formAction, isPending] = useActionState(async (prev: string | null, fd: FormData) => {
    fd.append('access_token',  tokens.access_token)
    fd.append('refresh_token', tokens.refresh_token)
    const result = await resetPasswordAction(prev, fd)
    if (!result) setDone(true)
    return result
  }, null)

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
          ✦ nuevo conjuro
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, margin: '0 0 10px', letterSpacing: -0.5 }}>
          Nueva palabra-llave
        </h1>

        {!tokens.access_token && (
          <div style={{ padding: '16px 20px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-lg)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)' }}>
            Enlace inválido o caducado.{' '}
            <Link href="/olvide-conjuro" style={{ color: 'var(--mist)', textDecoration: 'none' }}>Solicita uno nuevo →</Link>
          </div>
        )}

        {done ? (
          <div style={{ padding: '20px 24px', background: 'rgba(212,166,74,0.08)', border: '1px solid var(--spore)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--spore)', marginBottom: 8, fontWeight: 600 }}>
              ✦ Conjuro grabado
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-soft)', margin: '0 0 16px', lineHeight: 1.55 }}>
              Tu contraseña ha sido actualizada. Ya puedes entrar con el nuevo conjuro.
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{ padding: '10px 20px', background: 'var(--spore)', color: 'var(--accent-ink)', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}
            >
              Ir al portal →
            </button>
          </div>
        ) : tokens.access_token ? (
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                Nueva palabra-llave
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                style={{ width: '100%', padding: '13px 16px', background: 'var(--moss-800)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{ padding: 14, background: isPending ? 'var(--moss-700)' : 'var(--spore)', color: 'var(--accent-ink)', border: 'none', borderRadius: 'var(--r-md)', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}
            >
              {isPending ? 'Grabando conjuro…' : 'Guardar nueva contraseña'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}
