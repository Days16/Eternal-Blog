'use client'

import { useActionState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { FeaturedShelfEditor } from '@/components/profile/FeaturedShelfEditor'
import { BadgePicker } from '@/components/profile/BadgePicker'
import { EmailNotificationToggle } from '@/components/profile/EmailNotificationToggle'
import { updateProfileAction } from './actions'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--moss-800)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  marginBottom: 6,
}

export default function EditarPerfilPage() {
  const { data: session } = useSession()
  const user = session?.user as { name?: string; username?: string; bio?: string; avatar_url?: string } | undefined
  const [error, formAction, isPending] = useActionState(updateProfileAction, null)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <TopNav />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(80px,10vw,96px) clamp(16px,5vw,48px) 80px' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 12 }}>
          ✦ Tu grimorio
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 500, margin: '0 0 8px', lineHeight: 1 }}>
          Editar perfil
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 40 }}>
          Actualiza tu identidad en el bosque.
        </p>

        <RuneDivider />

        <form action={formAction} style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Nombre */}
          <div>
            <label style={labelStyle} htmlFor="pe-name">Nombre visible *</label>
            <input
              id="pe-name"
              name="name"
              required
              defaultValue={user?.name ?? ''}
              placeholder="Tu nombre en el bosque"
              style={fieldStyle}
            />
          </div>

          {/* Username */}
          <div>
            <label style={labelStyle} htmlFor="pe-username">Nombre de iniciado *</label>
            <input
              id="pe-username"
              name="username"
              required
              defaultValue={(user as { username?: string })?.username ?? ''}
              placeholder="solo_letras_y_numeros"
              pattern="[a-z0-9_]{3,20}"
              style={fieldStyle}
            />
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', marginTop: 5 }}>
              3-20 caracteres. Solo letras minúsculas, números y guión bajo.
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle} htmlFor="pe-bio">Bio</label>
            <textarea
              id="pe-bio"
              name="bio"
              rows={4}
              maxLength={300}
              defaultValue={(user as { bio?: string })?.bio ?? ''}
              placeholder="Cuéntale al bosque quién eres (máx. 300 caracteres)."
              style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label style={labelStyle} htmlFor="pe-avatar">URL del avatar</label>
            <input
              id="pe-avatar"
              name="avatar_url"
              type="url"
              defaultValue={(user as { avatar_url?: string })?.avatar_url ?? ''}
              placeholder="https://..."
              style={fieldStyle}
            />
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', marginTop: 5 }}>
              La carga directa de imágenes estará disponible próximamente.
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(168,50,50,0.12)', border: '1px solid var(--ember)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--ember)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={isPending}
              style={{ flex: 1, padding: '14px', background: isPending ? 'var(--moss-700)' : 'var(--spore)', color: 'var(--accent-ink)', border: 'none', borderRadius: 'var(--r-md)', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}
            >
              {isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <Link href="/perfil" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{ padding: '14px 24px', background: 'none', color: 'var(--text-mute)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 14 }}
              >
                Cancelar
              </button>
            </Link>
          </div>
        </form>

        {/* Escaparate de artículos */}
        <div style={{ marginTop: 56 }}>
          <RuneDivider char="ᛟ" />
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 8 }}>
              ✦ Escaparate
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 8px', lineHeight: 1 }}>
              Artículos destacados
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 24 }}>
              Elige hasta 3 artículos que aparecerán en tu perfil público.
            </p>
            <FeaturedShelfEditor />
          </div>
        </div>

        {/* Notificaciones */}
        <div style={{ marginTop: 56 }}>
          <RuneDivider char="ᛖ" />
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 8 }}>
              ✦ Notificaciones
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 8px', lineHeight: 1 }}>
              Avisos por correo
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 24 }}>
              Recibe un aviso en tu correo cuando se publique algo nuevo.
            </p>
            <EmailNotificationToggle />
          </div>
        </div>

        {/* Insignia de logro */}
        <div style={{ marginTop: 56 }}>
          <RuneDivider char="ᚨ" />
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 8 }}>
              ✦ Insignia
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, margin: '0 0 8px', lineHeight: 1 }}>
              Tu insignia de nombre
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 24 }}>
              Muestra tu veteranía. Elige qué insignia mostrar junto a tu nombre.
            </p>
            <BadgePicker />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
