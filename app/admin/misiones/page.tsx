import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { getAdminMissions, type MissionStatus } from '@/lib/supabase/queries/admin'
import { archiveMissionAction, deleteMissionAction } from '@/app/admin/actions'
import { formatDate } from '@/lib/utils/dates'

type Props = { searchParams: Promise<{ tab?: string }> }

const TAB_CONFIG: { key: MissionStatus | 'all'; label: string }[] = [
  { key: 'active', label: 'Activas' },
  { key: 'open',   label: 'Sin fin' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'expired', label: 'Expiradas' },
]

const STATUS_CONFIG: Record<MissionStatus, { label: string; color: string; dot: string }> = {
  active:   { label: 'Activa',    color: 'var(--spore)',    dot: '●' },
  open:     { label: 'Sin fin',   color: 'var(--mist)',     dot: '◉' },
  upcoming: { label: 'Próxima',   color: 'var(--text-mute)',dot: '○' },
  expired:  { label: 'Expirada',  color: 'var(--ember)',    dot: '◌' },
}

const CRITERIA_LABELS: Record<string, { icon: string; label: string }> = {
  comment_count:    { icon: '✉', label: 'Comentarios' },
  reaction_given:   { icon: '◊', label: 'Reacciones' },
  easter_egg_found: { icon: '✦', label: 'Secretos' },
  entry_published:  { icon: '✎', label: 'Entradas' },
  xp_total:         { icon: '⬡', label: 'XP total' },
  level_reached:    { icon: '◆', label: 'Nivel' },
  streak_days:      { icon: '⚑', label: 'Racha' },
}

function getDifficulty(xp: number | null) {
  const n = xp ?? 0
  if (n <= 25)  return { label: 'Iniciado',   color: 'var(--mist)' }
  if (n <= 75)  return { label: 'Adepto',     color: 'var(--spore)' }
  if (n <= 150) return { label: 'Druida',     color: 'var(--amethyst)' }
  return              { label: 'Archimago',   color: 'var(--ember)' }
}

function getTimeLeft(endsAt: Date | null): string | null {
  if (!endsAt) return null
  const diff = endsAt.getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return null
  if (days === 0) return 'Termina hoy'
  if (days === 1) return '1 día restante'
  return `${days} días restantes`
}

export default async function AdminMissionsPage({ searchParams }: Props) {
  const { tab = 'active' } = await searchParams
  const missions = await getAdminMissions()

  const counts: Record<string, number> = {
    active:   missions.filter(m => m.status === 'active').length,
    open:     missions.filter(m => m.status === 'open').length,
    upcoming: missions.filter(m => m.status === 'upcoming').length,
    expired:  missions.filter(m => m.status === 'expired').length,
  }

  const visible = missions.filter(m => m.status === tab)

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 4px' }}>
            Misiones
          </h1>
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
            Juramentos que guían a los lectores hacia el siguiente nivel
          </p>
        </div>
        <Link href="/admin/misiones/nueva">
          <Btn variant="rune">+ Nueva misión</Btn>
        </Link>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {TAB_CONFIG.map(({ key, label }) => {
          const cfg = key !== 'all' ? STATUS_CONFIG[key] : null
          const count = counts[key] ?? 0
          const isActive = tab === key
          return (
            <Link
              key={key}
              href={`/admin/misiones?tab=${key}`}
              style={{
                display: 'block',
                background: isActive ? 'color-mix(in srgb, var(--spore) 10%, var(--bg-card))' : 'var(--bg-card)',
                border: `1px solid ${isActive ? 'var(--spore)' : 'var(--border-soft)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '16px 20px',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: cfg?.color ?? 'var(--text)', lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 6 }}>
                {label}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Lista de misiones */}
      <div style={{ display: 'grid', gap: 12 }}>
        {visible.length === 0 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: '32px 24px',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            color: 'var(--text-mute)',
            textAlign: 'center',
          }}>
            No hay misiones en este estado.{' '}
            {tab === 'active' || tab === 'open' ? (
              <Link href="/admin/misiones/nueva" style={{ color: 'var(--spore)', textDecoration: 'none' }}>
                Crear una →
              </Link>
            ) : null}
          </div>
        )}

        {visible.map(mission => {
          const statusCfg = STATUS_CONFIG[mission.status]
          const criteria = CRITERIA_LABELS[mission.criteriaType ?? ''] ?? { icon: '?', label: mission.criteriaType ?? '-' }
          const difficulty = getDifficulty(mission.xpReward)
          const timeLeft = getTimeLeft(mission.endsAt)

          return (
            <div
              key={mission.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-lg)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                {/* Izquierda: glifo + info */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 32,
                    color: 'var(--spore)',
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 40,
                    textAlign: 'center',
                  }}>
                    {mission.glyph}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {mission.title ?? 'Sin título'}
                    </div>
                    {mission.description && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', marginBottom: 10 }}>
                        {mission.description}
                      </div>
                    )}

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
                      <span>
                        {criteria.icon} {criteria.label} · objetivo {mission.criteriaValue ?? '?'}
                      </span>
                      <span style={{ color: difficulty.color }}>
                        {mission.xpReward ?? 0} XP · {difficulty.label}
                      </span>
                      <span>
                        {mission.completionCount} completada{mission.completionCount === 1 ? '' : 's'}
                      </span>
                      {mission.startsAt && (
                        <span>desde {formatDate(mission.startsAt)}</span>
                      )}
                      {mission.endsAt && (
                        <span>hasta {formatDate(mission.endsAt)}</span>
                      )}
                      {timeLeft && (
                        <span style={{ color: 'var(--spore)' }}>{timeLeft}</span>
                      )}
                      {!mission.endsAt && (
                        <span style={{ color: 'var(--mist)' }}>permanente</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Derecha: badge + acciones */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: statusCfg.color,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                    {statusCfg.dot} {statusCfg.label}
                  </span>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href={`/admin/misiones/${mission.id}`}
                      style={{
                        padding: '5px 14px',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 'var(--r-sm)',
                        color: 'var(--text-soft)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 12,
                        textDecoration: 'none',
                        transition: 'border-color 0.1s',
                      }}
                    >
                      Editar
                    </Link>

                    {mission.completionCount === 0 ? (
                      <form action={deleteMissionAction}>
                        <input type="hidden" name="id" value={mission.id} />
                        <button
                          type="submit"
                          onClick={e => { if (!confirm('¿Eliminar esta misión? Esta acción no se puede deshacer.')) e.preventDefault() }}
                          style={{
                            padding: '5px 14px',
                            border: '1px solid var(--ember)',
                            borderRadius: 'var(--r-sm)',
                            background: 'none',
                            color: 'var(--ember)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Eliminar
                        </button>
                      </form>
                    ) : (
                      <form action={archiveMissionAction}>
                        <input type="hidden" name="id" value={mission.id} />
                        <button
                          type="submit"
                          style={{
                            padding: '5px 14px',
                            border: '1px solid var(--border-soft)',
                            borderRadius: 'var(--r-sm)',
                            background: 'none',
                            color: 'var(--text-mute)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          {mission.status === 'expired' ? 'Eliminar' : 'Archivar'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
