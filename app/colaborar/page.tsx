import type { Metadata } from 'next'
import { auth } from '@/auth'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { getUserCollaboratorStatus } from '@/lib/supabase/queries/collaborator'
import { CollaboratorForm } from './CollaboratorForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Colaborar · ETERNIDAD',
  description: 'Postúlate como colaborador oficial del proyecto ETERNIDAD y forma parte de la creación.',
}

export default async function ColaborarPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user?.id
  const isAlreadyCollaborator = session?.user?.role === 'collaborator'
    || session?.user?.role === 'admin'
    || session?.user?.role === 'dev'

  const appStatus = isLoggedIn && !isAlreadyCollaborator
    ? await getUserCollaboratorStatus(session!.user.id)
    : null

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <main style={{ padding: 'clamp(40px, 8vw, 96px) clamp(16px, 5vw, 64px)', maxWidth: 760, margin: '0 auto' }}>

        {/* ── Cabecera ──────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--amethyst)', marginBottom: 16 }}>
            ᛟ · Rango especial
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 600, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: -1 }}>
            Colaborador
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.75, color: 'var(--text-soft)', maxWidth: 600 }}>
            ETERNIDAD no es solo un blog: es un proyecto vivo. Si quieres participar activamente —
            escribiendo, documentando, ampliando el Codex o ayudando a construir el universo —
            puedes postularte al rango de Colaborador.
          </p>
        </div>

        <RuneDivider char="ᚹ" />

        {/* ── Qué hace ───────────────────────────────────────── */}
        <ul style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.9, color: 'var(--text-soft)', paddingLeft: 20, marginBottom: 48, listStyleType: 'none', padding: 0 }}>
          {[
            '✦ Escribe relatos, fanfics o textos que complementan el universo.',
            '✦ Completa fichas del Codex con información proporcionada por el autor.',
            '✦ Ayuda a documentar criaturas, lugares, personajes o sucesos.',
            '✦ Trabaja en colaboración directa con el autor del proyecto.',
            '✦ Su nombre aparece en las entradas en las que colabora.',
          ].map((item, i) => (
            <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
              {item}
            </li>
          ))}
        </ul>

        <RuneDivider char="ᛁ" />

        {/* ── Estado o formulario ─────────────────────────────── */}
        {isAlreadyCollaborator ? (
          <div style={{ padding: '32px 24px', background: 'var(--bg-card)', border: '1px solid var(--amethyst)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--amethyst)', marginBottom: 12 }}>ᛟ</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)' }}>
              Ya formas parte del equipo. Tu rango de <strong>Colaborador</strong> está activo.
            </p>
          </div>
        ) : appStatus === 'pending' ? (
          <div style={{ padding: '32px 24px', background: 'var(--bg-card)', border: '1px solid var(--spore)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--spore)', marginBottom: 12 }}>⏳</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)' }}>
              Tu solicitud está <strong>pendiente de revisión</strong>. El autor se pondrá en contacto contigo.
            </p>
          </div>
        ) : appStatus === 'rejected' ? (
          <div style={{ marginBottom: 32, padding: '16px 20px', background: 'var(--moss-800)', border: '1px solid var(--ember)', borderRadius: 'var(--r-lg)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-mute)', margin: 0 }}>
              Tu solicitud anterior fue rechazada. Puedes volver a postularte con una nueva motivación.
            </p>
          </div>
        ) : null}

        {!isAlreadyCollaborator && appStatus !== 'pending' && (
          isLoggedIn ? (
            <CollaboratorForm />
          ) : (
            <div style={{ padding: '32px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)', marginBottom: 20 }}>
                Necesitas una cuenta para postularte como colaborador.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/registro" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, padding: '10px 24px', background: 'var(--spore)', color: 'var(--moss-900)', borderRadius: 'var(--r-md)', textDecoration: 'none', fontWeight: 600 }}>
                  Crear cuenta
                </Link>
                <Link href="/login" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, padding: '10px 24px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textDecoration: 'none', color: 'var(--text)' }}>
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )
        )}

      </main>

      <Footer />
    </div>
  )
}
