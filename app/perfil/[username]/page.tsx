import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { Tag } from '@/components/ui/Tag'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { ProfileSignOutButton } from '@/components/auth/ProfileSignOutButton'
import { LEVELS } from '@/components/ui/constants'
import type { LevelNumber } from '@/components/ui/constants'
import {
  getUserProfile,
  getUserStats,
  getUserAchievements,
  getUserActivity,
} from '@/lib/supabase/queries/users'
import { getXpProgress } from '@/lib/xp/events'
import { relativeTime } from '@/lib/utils/dates'

type Props = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await getUserProfile(username)
  if (!user) return {}
  return {
    title: `${user.name ?? username} · Perfil`,
    description: user.bio ?? `Perfil de ${user.name ?? username} en ETERNIDAD.`,
  }
}

const ACTIVITY_LABELS: Record<string, string> = {
  comment:              'Comentó en una entrada',
  reaction:             'Reaccionó a una entrada',
  entry_published:      'Publicó una entrada',
  achievement_unlocked: 'Desbloqueó un logro',
  easter_egg_found:     'Encontró un huevo de pascua',
  mission_completed:    'Completó una misión',
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { tab = 'logros' } = await searchParams

  const profile = await getUserProfile(username)
  if (!profile) notFound()
  const session = await auth()
  const isOwnProfile = session?.user?.id === profile.id

  const [profileStats, achievements, recentActivity] = await Promise.all([
    getUserStats(profile.id),
    getUserAchievements(profile.id),
    getUserActivity(profile.id, 15),
  ])

  const level = profile.level as LevelNumber
  const levelInfo = LEVELS[level - 1]
  const xpProgress = getXpProgress(profile.xp)
  const joinDate = profile.createdAt ? relativeTime(profile.createdAt) : '—'

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Banner ─────────────────────────────────────────── */}
      <section style={{ position: 'relative' }}>
        <ImagePlaceholder height={200} tone="forest" label="" />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(11,17,25,0) 0%, rgba(11,17,25,1) 100%)',
        }} />
      </section>

      <div style={{ padding: '0 clamp(16px, 5vw, 64px)', marginTop: -70 }}>

        {/* ── Cabecera de usuario ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'var(--moss-700)', border: '4px solid var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 32px ${levelInfo.color}44`,
              fontFamily: 'var(--font-display)', fontSize: 64,
              color: levelInfo.color,
            }}>
              {levelInfo.rune}
            </div>
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--bg)', borderRadius: '50%', padding: 4 }}>
              <LevelBadge level={level} size={36} />
            </div>
          </div>

          {/* Datos */}
          <div style={{ flex: '1 1 240px', minWidth: 0, maxWidth: '100%', paddingBottom: 12, overflow: 'visible' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 9vw, 44px)', fontWeight: 600, margin: '0 0 10px', letterSpacing: -0.8, lineHeight: 1.25, overflowWrap: 'anywhere', overflow: 'visible', paddingBottom: 4 }}>
              {profile.name ?? profile.username}
            </h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              {profile.role === 'admin' && (
                <Tag color="var(--ember)">Admin</Tag>
              )}
              {profile.role === 'moderator' && (
                <Tag color="var(--mist)">Moderador</Tag>
              )}
              {profile.specialRole && (
                <Tag color="var(--amethyst)">{profile.specialRole}</Tag>
              )}
              <Tag color={levelInfo.color}>{levelInfo.name}</Tag>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mute)' }}>
                · se unió {joinDate}
              </span>
            </div>
            {profile.bio && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontStyle: 'italic', color: 'var(--text-soft)', maxWidth: 480 }}>
                &ldquo;{profile.bio}&rdquo;
              </div>
            )}
            {isOwnProfile && (
              <div style={{ marginTop: 14 }}>
                <ProfileSignOutButton />
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, maxWidth: 760 }}>
          <StatCard value={profile.xp.toLocaleString('es-ES')} label="XP totales" color="var(--spore)" />
          <StatCard value={profileStats.commentCount.toString()} label="comentarios" color="var(--mist)" />
          <StatCard value={unlockedCount.toString()} label={`logros · de ${achievements.length}`} color="var(--amethyst)" />
        </div>

        {/* ── Barra de nivel ──────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 32,
          position: 'relative', overflow: 'hidden', maxWidth: 760,
        }}>
          <div style={{
            position: 'absolute', right: 24, top: 12,
            fontFamily: 'var(--font-display)', fontSize: 120,
            color: levelInfo.color, opacity: 0.08, lineHeight: 1,
          }}>
            {levelInfo.rune}
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: levelInfo.color }}>
            Nivel actual
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, margin: '4px 0 14px' }}>
            {level} · {levelInfo.name}
          </div>
          <div style={{ height: 8, background: 'var(--moss-800)', borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${xpProgress.progressPct}%`, height: '100%',
              background: `linear-gradient(90deg, ${levelInfo.color}99, ${levelInfo.color})`,
              boxShadow: `0 0 12px ${levelInfo.color}66`,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
            <span>{profile.xp.toLocaleString('es-ES')} XP</span>
            {xpProgress.xpToNext !== null
              ? <span>· {xpProgress.xpToNext.toLocaleString('es-ES')} para {xpProgress.next?.name}</span>
              : <span>· Nivel máximo alcanzado</span>
            }
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border)', marginBottom: 32, maxWidth: 900 }}>
          {(['logros', 'actividad'] as const).map(t => (
            <Link
              key={t}
              href={`/perfil/${username}?tab=${t}`}
              style={{
                padding: '14px 0',
                fontFamily: 'var(--font-ui)', fontSize: 13,
                color: tab === t ? 'var(--spore)' : 'var(--text-mute)',
                fontWeight: tab === t ? 600 : 400,
                borderBottom: `2px solid ${tab === t ? 'var(--spore)' : 'transparent'}`,
                textDecoration: 'none', textTransform: 'capitalize',
                transition: 'color var(--t-fast)',
              }}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* ── Logros ──────────────────────────────────────── */}
        {tab === 'logros' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 64, maxWidth: 900 }}>
            {achievements.length === 0 ? (
              <p style={{ gridColumn: '1/-1', fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic' }}>
                Los logros aún no están disponibles.
              </p>
            ) : achievements.map(a => (
              <div key={a.id} style={{
                padding: 18,
                background: a.unlocked ? 'var(--bg-card)' : 'var(--moss-900)',
                border: `1px solid ${a.unlocked ? 'var(--border)' : 'var(--border-soft)'}`,
                borderRadius: 'var(--r-lg)', textAlign: 'center',
                opacity: a.unlocked ? 1 : 0.55,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: a.unlocked ? `${a.color ?? 'var(--spore)'}18` : 'var(--moss-800)',
                  color: a.unlocked ? (a.color ?? 'var(--spore)') : 'var(--text-mute)',
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 26,
                  border: `1.5px solid ${a.unlocked ? (a.color ?? 'var(--spore)') : 'var(--border)'}`,
                }}>
                  {a.runeGlyph ?? 'ᛟ'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  {a.name}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                  {a.description}
                </div>
                {!a.unlocked && (
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    ◌ por desbloquear
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Actividad ────────────────────────────────────── */}
        {tab === 'actividad' && (
          <div style={{ maxWidth: 760, marginBottom: 64 }}>
            {recentActivity.length === 0 ? (
              <div style={{
                padding: 40, background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-lg)', textAlign: 'center',
                fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic',
              }}>
                Aún no hay actividad registrada.
              </div>
            ) : recentActivity.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-soft)' : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--moss-800)', border: '1px solid var(--border-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--spore)',
                }}>
                  {item.kind === 'comment' ? '✦' : item.kind === 'achievement_unlocked' ? 'ᛟ' : '◊'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>
                    {ACTIVITY_LABELS[item.kind ?? ''] ?? item.kind}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>
                    {item.createdAt ? relativeTime(item.createdAt) : ''}
                  </div>
                </div>
                {item.xpDelta > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--spore)' }}>
                    +{item.xpDelta} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{
      padding: 20, background: 'var(--bg-card)',
      border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}
