import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { getPublicRoadmap, type RoadmapItem, type RoadmapPhase } from '@/lib/supabase/queries/roadmap'

export const metadata: Metadata = {
  title: 'Horizonte · La senda trazada',
  description: 'Mapa del camino recorrido y las tierras por venir. Qué está hecho, qué se está forjando y qué aguarda en el horizonte de ETERNIDAD.',
}

const PHASE_CONFIG: Record<RoadmapPhase, {
  label: string
  rune: string
  icon: string
  color: string
  dimColor: string
  description: string
}> = {
  done: {
    label: 'Completado',
    rune: 'ᚨ',
    icon: '✦',
    color: 'var(--spore)',
    dimColor: 'rgba(212,166,74,0.08)',
    description: 'Lo que ya ha sido conjurado y vive en el bosque.',
  },
  in_progress: {
    label: 'En forja',
    rune: 'ᛁ',
    icon: '◈',
    color: 'var(--mist)',
    dimColor: 'rgba(110,139,184,0.08)',
    description: 'Hechizos a medio trazar, activos en el telar.',
  },
  next: {
    label: 'Próximamente',
    rune: 'ᛊ',
    icon: '◇',
    color: 'var(--amethyst)',
    dimColor: 'rgba(124,74,142,0.08)',
    description: 'Tierras que ya tienen nombre y se dibujarán pronto.',
  },
  future: {
    label: 'En el horizonte',
    rune: 'ᛞ',
    icon: '○',
    color: 'var(--text-mute)',
    dimColor: 'rgba(255,255,255,0.03)',
    description: 'Visiones lejanas, posibles. Aún sin fecha en el grimorio.',
  },
}

const PHASE_ORDER: RoadmapPhase[] = ['in_progress', 'next', 'done', 'future']

function VersionTag({ tag }: { tag: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      padding: '2px 7px',
      borderRadius: 4,
      background: 'var(--moss-800)',
      border: '1px solid var(--border-soft)',
      color: 'var(--text-mute)',
      letterSpacing: 0.5,
      flexShrink: 0,
    }}>
      {tag}
    </span>
  )
}

function PhaseSection({ phase, items }: { phase: RoadmapPhase; items: RoadmapItem[] }) {
  const cfg = PHASE_CONFIG[phase]
  if (items.length === 0) return null

  return (
    <section>
      {/* Cabecera de fase */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          color: cfg.color,
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.85,
        }}>
          {cfg.rune}
        </span>
        <div>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: cfg.color,
            fontWeight: 700,
            marginBottom: 2,
          }}>
            {cfg.icon} {cfg.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--text-mute)',
            fontStyle: 'italic',
          }}>
            {cfg.description}
          </div>
        </div>
      </div>

      {/* Cuadrícula de ítems */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 10,
        marginBottom: 8,
      }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              background: cfg.dimColor,
              border: `1px solid color-mix(in srgb, ${cfg.color} 18%, var(--border-soft))`,
              borderRadius: 'var(--r-lg)',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                lineHeight: 1.35,
              }}>
                {item.title}
              </span>
              {item.versionTag && <VersionTag tag={item.versionTag} />}
            </div>
            {item.description && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--text-mute)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.description}
              </p>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 'auto',
            }}>
              <span style={{ color: cfg.color, fontSize: 11 }}>{cfg.icon}</span>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                color: cfg.color,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                {cfg.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function HorizontePage() {
  const roadmap = await getPublicRoadmap()

  const totalDone = roadmap.done.length
  const totalItems = Object.values(roadmap).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(80px,10vw,96px) clamp(16px,5vw,48px) 80px' }}>

        {/* Cabecera */}
        <header style={{ marginBottom: 56 }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--spore)',
            marginBottom: 14,
            fontWeight: 700,
          }}>
            ᚱ La senda trazada
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 7vw, 72px)',
            fontWeight: 500,
            margin: '0 0 16px',
            lineHeight: 1,
            letterSpacing: -1.5,
          }}>
            Horizonte
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 17,
            color: 'var(--text-soft)',
            lineHeight: 1.65,
            fontStyle: 'italic',
            maxWidth: 560,
            margin: '0 0 32px',
          }}>
            Mapa del camino recorrido y las tierras por venir.
            Todo lo que ETERNIDAD ha sido, es y quiere llegar a ser.
          </p>

          {/* Barra de progreso */}
          {totalItems > 0 && (
            <div style={{ maxWidth: 400 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-mute)',
                marginBottom: 8,
              }}>
                <span>{totalDone} conjuros completados</span>
                <span style={{ color: 'var(--spore)' }}>{Math.round((totalDone / totalItems) * 100)}%</span>
              </div>
              <div style={{
                height: 4,
                background: 'var(--moss-700)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(totalDone / totalItems) * 100}%`,
                  background: 'linear-gradient(90deg, var(--rune), var(--spore))',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                  boxShadow: 'var(--glow-spore)',
                }} />
              </div>
            </div>
          )}
        </header>

        <RuneDivider />

        {/* Fases */}
        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 52 }}>
          {PHASE_ORDER.map(phase => (
            <PhaseSection key={phase} phase={phase} items={roadmap[phase]} />
          ))}
        </div>

        {/* Nota al pie */}
        <div style={{
          marginTop: 72,
          padding: '24px 28px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-mute)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.6,
          }}>
            Este mapa se actualiza a medida que el bosque crece.
            Las visiones del horizonte pueden cambiar de orden, fusionarse o desvanecerse
            según lo que el grimorio dicte. Ninguna profecía es inamovible.
          </p>
        </div>

        {/* ── CTA Colaborar ───────────────────────────────── */}
        <div style={{
          marginTop: 40,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, var(--moss-800), var(--moss-900))',
          border: '1px solid var(--amethyst)',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--amethyst)', marginBottom: 8 }}>
              ᛟ · Rango especial
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
              ¿Quieres colaborar?
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
              Si te apetece ayudar a construir el universo de ETERNIDAD —
              escribiendo, documentando o expandiendo el Codex —
              puedes postularte al rango de Colaborador.
            </p>
          </div>
          <Link
            href="/colaborar"
            style={{
              fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
              padding: '12px 28px', borderRadius: 'var(--r-md)',
              background: 'var(--amethyst)', color: '#fff',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Más información
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  )
}
