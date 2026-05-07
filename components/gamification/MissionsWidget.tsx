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
    case 'comment_count':
      return 'Comentarios'
    case 'reaction_given':
      return 'Reacciones dadas'
    case 'easter_egg_found':
      return 'Secretos hallados'
    case 'entry_published':
      return 'Entradas publicadas'
    case 'xp_total':
      return 'XP acumulada'
    case 'level_reached':
      return 'Nivel alcanzado'
    default:
      return mission.criteriaType
  }
}

export function MissionsWidget({ userId }: { userId: string | null }) {
  const { data, error, isLoading } = useSWR<MissionsResponse>(userId ? '/api/missions' : null, fetcher)

  if (!userId) return null

  const completedIds = data?.completed ?? []
  const pendingMissions = data?.active.filter(mission => !completedIds.includes(mission.id)) ?? []
  const completedMissions = data?.active.filter(mission => completedIds.includes(mission.id)) ?? []

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
                        <div>
                          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 16, color: 'var(--text)', fontWeight: 600 }}>
                            {mission.title}
                          </div>
                          {mission.description && (
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', marginTop: 4 }}>
                              {mission.description}
                            </div>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--spore)' }}>
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
