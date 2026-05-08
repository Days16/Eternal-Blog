import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { getAdminAchievements } from '@/lib/supabase/queries/admin'
import { DeleteAchievementButton } from '@/components/admin/DeleteAchievementButton'

type Props = { searchParams: Promise<{ criteria?: string }> }

const CRITERIA_FILTERS = [
  { value: 'all',              icon: '◈', label: 'Todos' },
  { value: 'comment_count',    icon: '✉', label: 'Comentarios' },
  { value: 'reaction_given',   icon: '◊', label: 'Reacciones' },
  { value: 'xp_total',         icon: '⬡', label: 'XP' },
  { value: 'level_reached',    icon: '◆', label: 'Nivel' },
  { value: 'easter_egg_found', icon: '✦', label: 'Secretos' },
  { value: 'easter_egg_all',   icon: '✧', label: 'Todos los secretos' },
  { value: 'entry_published',  icon: '✎', label: 'Entradas' },
]

const CRITERIA_LABELS: Record<string, { icon: string; label: string }> = {
  comment_count:    { icon: '✉', label: 'Comentarios' },
  reaction_given:   { icon: '◊', label: 'Reacciones dadas' },
  entry_published:  { icon: '✎', label: 'Entradas publicadas' },
  xp_total:         { icon: '⬡', label: 'XP acumulada' },
  easter_egg_found: { icon: '✦', label: 'Secretos hallados' },
  easter_egg_all:   { icon: '✧', label: 'Todos los secretos' },
  level_reached:    { icon: '◆', label: 'Nivel alcanzado' },
}

function getDifficulty(xp: number) {
  if (xp <= 0)  return null
  if (xp <= 25)  return { label: 'Iniciado',   color: 'var(--mist)' }
  if (xp <= 75)  return { label: 'Adepto',     color: 'var(--spore)' }
  if (xp <= 150) return { label: 'Druida',     color: 'var(--amethyst)' }
  return               { label: 'Archimago',   color: 'var(--ember)' }
}

export default async function AdminAchievementsPage({ searchParams }: Props) {
  const { criteria = 'all' } = await searchParams
  const achievements = await getAdminAchievements()

  const totalUnlocks = achievements.reduce((sum, a) => sum + a.unlockCount, 0)
  const visible = criteria === 'all'
    ? achievements
    : achievements.filter(a => a.criteriaType === criteria)

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 4px' }}>
            Logros
          </h1>
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
            Recompensas desbloqueables por la comunidad
          </p>
        </div>
        <Link href="/admin/logros/nueva">
          <Btn variant="rune">+ Nuevo logro</Btn>
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Logros totales',       value: achievements.length,    color: 'var(--text)' },
          { label: 'Veces desbloqueado',   value: totalUnlocks,           color: 'var(--spore)' },
          { label: 'Sin desbloqueos aún',  value: achievements.filter(a => a.unlockCount === 0).length, color: 'var(--text-mute)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: '16px 20px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 6 }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros por criterio */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CRITERIA_FILTERS.map(f => {
          const isActive = f.value === criteria
          const count = f.value === 'all'
            ? achievements.length
            : achievements.filter(a => a.criteriaType === f.value).length
          if (count === 0 && f.value !== 'all') return null
          return (
            <Link
              key={f.value}
              href={`/admin/logros?criteria=${f.value}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                border: '1px solid',
                borderColor: isActive ? 'var(--spore)' : 'var(--border-soft)',
                borderRadius: 'var(--r-sm)',
                background: isActive ? 'var(--spore)' : 'transparent',
                color: isActive ? 'var(--moss-900)' : 'var(--text-soft)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{
                background: isActive ? 'var(--moss-900)' : 'var(--border-soft)',
                color: isActive ? 'var(--spore)' : 'var(--text-mute)',
                borderRadius: 999,
                fontSize: 10,
                padding: '1px 6px',
                fontWeight: 700,
              }}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Grid de logros */}
      {visible.length === 0 ? (
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
          No hay logros en esta categoría.{' '}
          <Link href="/admin/logros/nueva" style={{ color: 'var(--spore)', textDecoration: 'none' }}>
            Crear uno →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {visible.map(achievement => {
            const criteria = CRITERIA_LABELS[achievement.criteriaType ?? ''] ?? { icon: '?', label: achievement.criteriaType ?? '-' }
            const accentColor = achievement.color ?? 'var(--spore)'
            const difficulty = getDifficulty(achievement.xpReward)

            return (
              <div
                key={achievement.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Glifo + nombre */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 40,
                    color: accentColor,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 44,
                    textAlign: 'center',
                  }}>
                    {achievement.runeGlyph ?? 'ᛟ'}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {achievement.name ?? 'Sin nombre'}
                    </div>
                    {achievement.description && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', marginTop: 3, lineHeight: 1.4 }}>
                        {achievement.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
                  <span>{criteria.icon} {criteria.label}{achievement.criteriaType !== 'easter_egg_all' && achievement.criteriaValue != null ? ` · ${achievement.criteriaValue}` : ''}</span>
                  {achievement.xpReward > 0 && (
                    <span style={{ color: difficulty?.color ?? accentColor }}>
                      +{achievement.xpReward} XP{difficulty ? ` · ${difficulty.label}` : ''}
                    </span>
                  )}
                </div>

                {/* Estadística de desbloqueos */}
                <div style={{
                  padding: '8px 12px',
                  background: achievement.unlockCount > 0
                    ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                    : 'var(--moss-900)',
                  borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: achievement.unlockCount > 0 ? accentColor : 'var(--text-mute)',
                }}>
                  {achievement.unlockCount === 0
                    ? '◌ Sin desbloqueos aún'
                    : `✓ ${achievement.unlockCount} usuario${achievement.unlockCount === 1 ? '' : 's'} lo desbloquearon`}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link
                    href={`/admin/logros/${achievement.id}`}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text-soft)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'border-color 0.1s',
                    }}
                  >
                    Editar
                  </Link>

                  {achievement.unlockCount === 0 && (
                    <DeleteAchievementButton id={achievement.id} name={achievement.name ?? ''} />
                  )}

                  {achievement.unlockCount > 0 && (
                    <div style={{
                      flex: 1,
                      padding: '7px 0',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text-mute)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      textAlign: 'center',
                    }}>
                      Con historial
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
