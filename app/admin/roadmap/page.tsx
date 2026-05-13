import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { getAdminRoadmap, type RoadmapPhase } from '@/lib/supabase/queries/roadmap'
import { RoadmapDeleteButton, RoadmapTogglePublicButton } from '@/components/admin/RoadmapItemActions'

const PHASE_CONFIG: Record<RoadmapPhase, { label: string; icon: string; color: string }> = {
  done:        { label: 'Completado',      icon: '✦', color: 'var(--spore)' },
  in_progress: { label: 'En forja',        icon: '◈', color: 'var(--mist)' },
  next:        { label: 'Próximamente',    icon: '◇', color: 'var(--amethyst)' },
  future:      { label: 'En el horizonte', icon: '○', color: 'var(--text-mute)' },
}

const PHASE_ORDER: RoadmapPhase[] = ['in_progress', 'next', 'done', 'future']

export default async function AdminRoadmapPage() {
  const items = await getAdminRoadmap()

  const byPhase = Object.fromEntries(
    PHASE_ORDER.map(phase => [phase, items.filter(i => i.phase === phase)])
  ) as Record<RoadmapPhase, typeof items>

  const totalPublic  = items.filter(i => i.public).length
  const totalHidden  = items.filter(i => !i.public).length

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 4px' }}>
            Roadmap
          </h1>
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
            La senda pública del proyecto —{' '}
            <Link href="/horizonte" target="_blank" style={{ color: 'var(--mist)', textDecoration: 'none' }}>
              ver página ↗
            </Link>
          </p>
        </div>
        <Link href="/admin/roadmap/nueva">
          <Btn variant="rune">+ Nuevo ítem</Btn>
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {PHASE_ORDER.map(phase => {
          const cfg = PHASE_CONFIG[phase]
          return (
            <div key={phase} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)',
              padding: '14px 18px',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                {byPhase[phase].length}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 5 }}>
                {cfg.icon} {cfg.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Visibilidad */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 28,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-mute)',
      }}>
        <span>● {totalPublic} público{totalPublic !== 1 ? 's' : ''}</span>
        <span>○ {totalHidden} oculto{totalHidden !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabla por fases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {PHASE_ORDER.map(phase => {
          const cfg = PHASE_CONFIG[phase]
          const phaseItems = byPhase[phase]

          return (
            <div key={phase}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
              }}>
                <span style={{ color: cfg.color, fontSize: 14 }}>{cfg.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: cfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}>
                  {cfg.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-mute)',
                  marginLeft: 4,
                }}>
                  ({phaseItems.length})
                </span>
              </div>

              {phaseItems.length === 0 ? (
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  color: 'var(--text-mute)',
                  fontSize: 13,
                  padding: '8px 0',
                }}>
                  Sin ítems en esta fase.{' '}
                  <Link href="/admin/roadmap/nueva" style={{ color: 'var(--spore)', textDecoration: 'none' }}>
                    Añadir uno →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {phaseItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 'var(--r-lg)',
                        padding: '14px 18px',
                      }}
                    >
                      {/* Orden */}
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-mute)',
                        flexShrink: 0,
                        marginTop: 2,
                        width: 24,
                        textAlign: 'right',
                      }}>
                        {item.sortOrder}
                      </span>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: item.description ? 4 : 0 }}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                            {item.title}
                          </span>
                          {item.versionTag && (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: 'var(--moss-800)',
                              border: '1px solid var(--border-soft)',
                              color: 'var(--text-mute)',
                            }}>
                              {item.versionTag}
                            </span>
                          )}
                          {!item.public && (
                            <span style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: 'rgba(168,50,50,0.15)',
                              border: '1px solid var(--ember)',
                              color: 'var(--ember)',
                            }}>
                              oculto
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', margin: 0, lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <RoadmapTogglePublicButton id={item.id} isPublic={item.public} />

                        <Link
                          href={`/admin/roadmap/${item.id}`}
                          style={{
                            padding: '5px 12px',
                            border: '1px solid var(--border-soft)',
                            borderRadius: 'var(--r-sm)',
                            color: 'var(--text-soft)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 12,
                            textDecoration: 'none',
                          }}
                        >
                          Editar
                        </Link>

                        <RoadmapDeleteButton id={item.id} title={item.title} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
