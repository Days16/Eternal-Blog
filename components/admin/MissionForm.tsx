'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMissionAction } from '@/app/admin/actions'

const CRITERIA_OPTIONS = [
  {
    value: 'comment_count',
    icon: '✉',
    label: 'Comentarios',
    desc: 'El usuario debe dejar N comentarios no eliminados en cualquier entrada.',
    xpHint: '25 – 75',
  },
  {
    value: 'reaction_given',
    icon: '◊',
    label: 'Reacciones dadas',
    desc: 'El usuario debe reaccionar a N entradas distintas.',
    xpHint: '15 – 50',
  },
  {
    value: 'easter_egg_found',
    icon: '✦',
    label: 'Secretos hallados',
    desc: 'El usuario debe encontrar N easter eggs ocultos en el sitio.',
    xpHint: '30 – 100',
  },
  {
    value: 'entry_published',
    icon: '✎',
    label: 'Entradas publicadas',
    desc: 'El usuario debe publicar N entradas (solo aplica a Escribas, Moderadores y Admin).',
    xpHint: '50 – 150',
  },
  {
    value: 'xp_total',
    icon: '⬡',
    label: 'XP acumulada',
    desc: 'El usuario debe acumular N puntos de experiencia en total.',
    xpHint: '50 – 200',
  },
  {
    value: 'level_reached',
    icon: '◆',
    label: 'Nivel alcanzado',
    desc: 'El usuario debe alcanzar el nivel N. Escala: 1 Aprendiz · 2 Iniciado · 3 Adepto · 4 Druida · 5 Archimago.',
    xpHint: '75 – 250',
  },
  {
    value: 'streak_days',
    icon: '⚑',
    label: 'Racha activa',
    desc: 'El usuario debe mantener una racha de actividad de N días consecutivos.',
    xpHint: '30 – 100',
  },
] as const

const GLYPHS = ['ᛟ', 'ᛗ', 'ᛇ', 'ᛉ', 'ᚦ', 'ᚱ', 'ᚢ', 'ᛏ', 'ᚹ', 'ᚾ', 'ᛃ', 'ᛈ']

function getDifficulty(xp: number) {
  if (xp <= 25) return { label: 'Iniciado', color: 'var(--mist)' }
  if (xp <= 75) return { label: 'Adepto', color: 'var(--spore)' }
  if (xp <= 150) return { label: 'Druida', color: 'var(--amethyst)' }
  return { label: 'Archimago', color: 'var(--ember)' }
}

function toLocalDatetime(d: Date | null): string {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type MissionData = {
  id: string
  title: string | null
  description: string | null
  criteriaType: string | null
  criteriaValue: number | null
  xpReward: number | null
  glyph: string
  startsAt: Date | null
  endsAt: Date | null
}

type Props = { mission?: MissionData }

export function MissionForm({ mission }: Props) {
  const router = useRouter()
  const [criteriaType, setCriteriaType] = useState(mission?.criteriaType ?? 'comment_count')
  const [glyph, setGlyph] = useState(mission?.glyph ?? 'ᛟ')
  const [xp, setXp] = useState(mission?.xpReward ?? 50)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCriteria = CRITERIA_OPTIONS.find(o => o.value === criteriaType) ?? CRITERIA_OPTIONS[0]
  const difficulty = getDifficulty(xp)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--moss-900)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text)',
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    padding: '10px 12px',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'var(--text-mute)',
    marginBottom: 6,
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      await saveMissionAction(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la misión')
      setIsPending(false)
    }
  }

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/misiones')}
          style={{
            background: 'none',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text-mute)',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          ← Misiones
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', margin: 0 }}>
          {mission ? 'Editar misión' : 'Nueva misión'}
        </h1>
      </div>

      {error && (
        <div style={{
          background: 'color-mix(in srgb, var(--ember) 15%, transparent)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-md)',
          padding: '10px 16px',
          marginBottom: 20,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--ember)',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mission && <input type="hidden" name="id" value={mission.id} />}
        <input type="hidden" name="glyph" value={glyph} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Título */}
            <div>
              <label style={labelStyle}>Título *</label>
              <input
                name="title"
                required
                defaultValue={mission?.title ?? ''}
                placeholder="Ej: La Voz del Bosque"
                style={inputStyle}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                name="description"
                defaultValue={mission?.description ?? ''}
                placeholder="Explicación visible para el usuario…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* XP */}
            <div>
              <label style={labelStyle}>XP de recompensa *</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  name="xpReward"
                  type="number"
                  min={1}
                  required
                  value={xp}
                  onChange={e => setXp(Number(e.target.value))}
                  style={{ ...inputStyle, width: 120 }}
                />
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: difficulty.color,
                  letterSpacing: 1,
                }}>
                  {difficulty.label}
                </span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                Sugerido para {selectedCriteria.label.toLowerCase()}: {selectedCriteria.xpHint} XP
              </div>
            </div>

            {/* Glifo */}
            <div>
              <label style={labelStyle}>Glifo rúnico</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GLYPHS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGlyph(g)}
                    style={{
                      width: 40,
                      height: 40,
                      background: glyph === g ? 'var(--spore)' : 'var(--moss-900)',
                      border: `1px solid ${glyph === g ? 'var(--spore)' : 'var(--border-soft)'}`,
                      borderRadius: 'var(--r-sm)',
                      color: glyph === g ? 'var(--moss-900)' : 'var(--text-soft)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 20,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Tipo de criterio */}
            <div>
              <label style={labelStyle}>Tipo de criterio *</label>
              <select
                name="criteriaType"
                value={criteriaType}
                onChange={e => setCriteriaType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CRITERIA_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon}  {opt.label}
                  </option>
                ))}
              </select>
              <div style={{
                marginTop: 8,
                padding: '10px 12px',
                background: 'var(--moss-900)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--text-mute)',
                lineHeight: 1.5,
              }}>
                {selectedCriteria.desc}
              </div>
            </div>

            {/* Objetivo */}
            <div>
              <label style={labelStyle}>Objetivo (número) *</label>
              <input
                name="criteriaValue"
                type="number"
                min={1}
                required
                defaultValue={mission?.criteriaValue ?? 5}
                style={{ ...inputStyle, width: 140 }}
              />
              {criteriaType === 'level_reached' && (
                <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                  Niveles disponibles: 1 al 5
                </div>
              )}
            </div>

            {/* Fechas */}
            <div>
              <label style={labelStyle}>Empieza el</label>
              <input
                name="startsAt"
                type="datetime-local"
                defaultValue={toLocalDatetime(mission?.startsAt ?? null)}
                style={inputStyle}
              />
              <div style={{ marginTop: 4, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                Dejar vacío = empieza ya (inmediata)
              </div>
            </div>

            <div>
              <label style={labelStyle}>Termina el</label>
              <input
                name="endsAt"
                type="datetime-local"
                defaultValue={toLocalDatetime(mission?.endsAt ?? null)}
                style={inputStyle}
              />
              <div style={{ marginTop: 4, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                Dejar vacío = misión permanente (sin fin)
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: 8 }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  width: '100%',
                  background: isPending ? 'var(--border-soft)' : 'var(--spore)',
                  color: isPending ? 'var(--text-mute)' : 'var(--moss-900)',
                  border: 'none',
                  borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '12px 24px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  transition: 'background 0.15s',
                }}
              >
                {isPending ? 'Guardando…' : (mission ? 'Actualizar misión →' : 'Crear misión →')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
