'use client'

import useSWR from 'swr'
import type { Mission } from '@/lib/missions/evaluator'

interface MissionsResponse {
  active: Mission[]
  completed: string[]
}

async function fetcher(url: string): Promise<MissionsResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('No se pudieron cargar las misiones')
  return response.json() as Promise<MissionsResponse>
}

function criteriaLabel(mission: Mission) {
  switch (mission.criteriaType) {
    case 'comment_count':    return 'Comentarios'
    case 'reaction_given':   return 'Reacciones dadas'
    case 'easter_egg_found': return 'Secretos hallados'
    case 'entry_published':  return 'Entradas publicadas'
    case 'xp_total':         return 'XP acumulada'
    case 'level_reached':    return 'Nivel alcanzado'
    case 'streak_days':      return 'Racha activa'
    default:                 return mission.criteriaType
  }
}

function getTimeLeft(endsAt: string | null): string | null {
  if (!endsAt) return null
  const diff = new Date(endsAt).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return null
  if (days === 0) return 'Termina hoy'
  if (days === 1) return 'Queda 1 día'
  return `Quedan ${days} días`
}

interface MissionsWidgetProps {
  userId: string | null
  compact?: boolean
}

export function MissionsWidget({ userId, compact = false }: MissionsWidgetProps) {
  const { data, error, isLoading } = useSWR<MissionsResponse>(userId ? '/api/missions' : null, fetcher)

  if (!userId) return null

  const completedIds = data?.completed ?? []
  const pendingMissions = data?.active.filter(m => !completedIds.includes(m.id)) ?? []
  const completedMissions = data?.active.filter(m => completedIds.includes(m.id)) ?? []

  // En modo compacto, si no hay misiones pendientes no renderizamos nada
  if (compact && !isLoading && !error && pendingMissions.length === 0 && completedMissions.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: 20,
      }}>
        {/* Cabecera compacta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--spore)' }}>⚑</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)' }}>
              Misiones activas
            </span>
          </div>
          {data && completedMissions.length > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--spore)' }}>
              {completedMissions.length} ✓
            </span>
          )}
        </div>

        {isLoading && (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)' }}>
            Trazando misiones…
          </div>
        )}

        {error && (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)' }}>
            No se pudieron cargar.
          </div>
        )}

        {!isLoading && !error && data && pendingMissions.length === 0 && completedMissions.length > 0 && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--spore)', fontStyle: 'italic' }}>
            ✓ Todas las misiones completadas
          </div>
        )}

        {!isLoading && !error && data && pendingMissions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingMissions.map(mission => (
              <div key={mission.id} style={{
                padding: '10px 12px',
                background: 'var(--moss-900)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-sm)',
              }}>
                {/* Título + XP */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  {mission.glyph && (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--spore)', lineHeight: 1.2, flexShrink: 0 }}>
                      {mission.glyph}
                    </span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                        {mission.title}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--spore)', flexShrink: 0 }}>
                        +{mission.xpReward} XP
                      </span>
                    </div>
                    {getTimeLeft(mission.endsAt) && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>
                        {getTimeLeft(mission.endsAt)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Barra de progreso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginBottom: 4 }}>
                  <span>{criteriaLabel(mission)}</span>
                  <span>{Math.min(mission.currentValue, mission.criteriaValue)} / {mission.criteriaValue}</span>
                </div>
                <div style={{ height: 5, background: 'var(--moss-800)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${mission.progressPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--spore-dim), var(--spore))',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Versión completa (perfil) ────────────────────────────
  return (
    <section
      style={{
        background: 'var(--moss-800)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        marginBottom: 32,
        maxWidth: 760,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--spore)' }}>
            Misiones activas
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginTop: 4 }}>
            Juramentos del bosque
          </div>
        </div>
        {data && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
            {data.completed.length} completadas
          </span>
        )}
      </div>

      {isLoading && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mute)' }}>
          Trazando las misiones del día…
        </div>
      )}

      {error && (
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mute)' }}>
          No se pudieron cargar las misiones.
        </div>
      )}

      {!isLoading && !error && data && (
        <div style={{ display: 'grid', gap: 20 }}>
          {data.active.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic' }}>
              No hay misiones activas en este ciclo lunar.
            </div>
          ) : (
            <>
              {pendingMissions.length > 0 && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {pendingMissions.map(mission => (
                    <div
                      key={mission.id}
                      style={{
                        padding: 16,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
                          {mission.glyph && (
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--spore)', lineHeight: 1, flexShrink: 0 }}>
                              {mission.glyph}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 16, color: 'var(--text)', fontWeight: 600 }}>
                              {mission.title}
                            </div>
                            {mission.description && (
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', marginTop: 4 }}>
                                {mission.description}
                              </div>
                            )}
                            {getTimeLeft(mission.endsAt) && (
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>
                                {getTimeLeft(mission.endsAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--spore)', flexShrink: 0 }}>
                          +{mission.xpReward} XP
                        </div>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', marginBottom: 8 }}>
                          <span>{criteriaLabel(mission)}</span>
                          <span>{Math.min(mission.currentValue, mission.criteriaValue)} / {mission.criteriaValue}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--moss-900)', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${mission.progressPct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--spore-dim), var(--spore))',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {completedMissions.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 10 }}>
                    Misiones completadas
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {completedMissions.map(mission => (
                      <div
                        key={mission.id}
                        style={{
                          padding: 14,
                          background: 'rgba(212, 166, 74, 0.08)',
                          border: '1px solid var(--spore)',
                          borderRadius: 'var(--r-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text)' }}>
                          ✓ {mission.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--spore)' }}>
                          +{mission.xpReward} XP
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
