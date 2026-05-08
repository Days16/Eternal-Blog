'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAchievementAction } from '@/app/admin/actions'

const CRITERIA_OPTIONS = [
  {
    value: 'comment_count',
    icon: '✉',
    label: 'Comentarios',
    desc: 'El usuario debe dejar N comentarios no eliminados en cualquier entrada.',
    xpHint: '10 – 50',
    needsValue: true,
  },
  {
    value: 'reaction_given',
    icon: '◊',
    label: 'Reacciones dadas',
    desc: 'El usuario debe reaccionar a N entradas distintas.',
    xpHint: '10 – 30',
    needsValue: true,
  },
  {
    value: 'xp_total',
    icon: '⬡',
    label: 'XP acumulada',
    desc: 'El usuario debe acumular N puntos de experiencia en total.',
    xpHint: '0 – 100',
    needsValue: true,
  },
  {
    value: 'level_reached',
    icon: '◆',
    label: 'Nivel alcanzado',
    desc: 'El usuario debe alcanzar el nivel N. Escala: 1 Aprendiz · 2 Iniciado · 3 Adepto · 4 Druida · 5 Archimago.',
    xpHint: '50 – 200',
    needsValue: true,
  },
  {
    value: 'easter_egg_found',
    icon: '✦',
    label: 'Secretos hallados',
    desc: 'El usuario debe encontrar N easter eggs ocultos en el sitio.',
    xpHint: '20 – 80',
    needsValue: true,
  },
  {
    value: 'easter_egg_all',
    icon: '✧',
    label: 'Todos los secretos',
    desc: 'El usuario debe haber encontrado absolutamente todos los easter eggs del sitio. No requiere un número específico.',
    xpHint: '100 – 250',
    needsValue: false,
  },
  {
    value: 'entry_published',
    icon: '✎',
    label: 'Entradas publicadas',
    desc: 'El usuario debe publicar N entradas (solo aplicable a roles Escriba, Moderador y Admin).',
    xpHint: '50 – 150',
    needsValue: true,
  },
] as const

const GLYPHS = ['ᛟ', 'ᛗ', 'ᛇ', 'ᛉ', 'ᚦ', 'ᚱ', 'ᚢ', 'ᛏ', 'ᚹ', 'ᚾ', 'ᛃ', 'ᛈ']

const COLOR_OPTIONS = [
  { value: 'var(--spore)',    label: 'Dorado',  hex: '#d4a64a' },
  { value: 'var(--rune)',     label: 'Runa',    hex: '#c89b3c' },
  { value: 'var(--mist)',     label: 'Azul',    hex: '#6e8bb8' },
  { value: 'var(--amethyst)', label: 'Violeta', hex: '#7c4a8e' },
  { value: 'var(--ember)',    label: 'Rojo',    hex: '#a83232' },
  { value: 'var(--moss-100)', label: 'Claro',   hex: '#eef0f4' },
]

function getDifficulty(xp: number) {
  if (xp <= 25) return { label: 'Iniciado', color: 'var(--mist)' }
  if (xp <= 75) return { label: 'Adepto', color: 'var(--spore)' }
  if (xp <= 150) return { label: 'Druida', color: 'var(--amethyst)' }
  return { label: 'Archimago', color: 'var(--ember)' }
}

type AchievementData = {
  id: string
  slug: string | null
  name: string | null
  description: string | null
  runeGlyph: string | null
  color: string | null
  criteriaType: string | null
  criteriaValue: unknown
  xpReward: number
  unlockCount: number
}

type Props = { achievement?: AchievementData }

export function AchievementForm({ achievement }: Props) {
  const router = useRouter()
  const [criteriaType, setCriteriaType] = useState(achievement?.criteriaType ?? 'comment_count')
  const [glyph, setGlyph] = useState(achievement?.runeGlyph ?? 'ᛟ')
  const [color, setColor] = useState(achievement?.color ?? 'var(--spore)')
  const [xp, setXp] = useState(achievement?.xpReward ?? 0)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCriteria = CRITERIA_OPTIONS.find(o => o.value === criteriaType) ?? CRITERIA_OPTIONS[0]
  const difficulty = getDifficulty(xp)
  const selectedColor = COLOR_OPTIONS.find(c => c.value === color) ?? COLOR_OPTIONS[0]

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
      await saveAchievementAction(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el logro')
      setIsPending(false)
    }
  }

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/logros')}
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
          ← Logros
        </button>

        {/* Preview en vivo del glifo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, color, lineHeight: 1 }}>
            {glyph}
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', margin: 0 }}>
          {achievement ? 'Editar logro' : 'Nuevo logro'}
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
        {achievement && <input type="hidden" name="id" value={achievement.id} />}
        <input type="hidden" name="runeGlyph" value={glyph} />
        <input type="hidden" name="color" value={color} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                name="name"
                required
                defaultValue={achievement?.name ?? ''}
                placeholder="Ej: La Voz del Bosque"
                style={inputStyle}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={labelStyle}>Slug</label>
              <input
                name="slug"
                defaultValue={achievement?.slug ?? ''}
                placeholder="se genera automáticamente si está vacío"
                style={inputStyle}
              />
              <div style={{ marginTop: 4, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                Identificador único en minúsculas y guiones
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                name="description"
                defaultValue={achievement?.description ?? ''}
                placeholder="Visible para el usuario al desbloquear el logro…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* XP */}
            <div>
              <label style={labelStyle}>XP de recompensa</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  name="xpReward"
                  type="number"
                  min={0}
                  value={xp}
                  onChange={e => setXp(Number(e.target.value))}
                  style={{ ...inputStyle, width: 120 }}
                />
                {xp > 0 && (
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, color: difficulty.color, letterSpacing: 1 }}>
                    {difficulty.label}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                Sugerido para {selectedCriteria.label.toLowerCase()}: {selectedCriteria.xpHint} XP · 0 = solo visual
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
                      background: glyph === g ? color : 'var(--moss-900)',
                      border: `1px solid ${glyph === g ? 'transparent' : 'var(--border-soft)'}`,
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

            {/* Color */}
            <div>
              <label style={labelStyle}>Color del logro</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    title={opt.label}
                    style={{
                      width: 32,
                      height: 32,
                      background: opt.hex,
                      border: `2px solid ${color === opt.value ? 'var(--text)' : 'transparent'}`,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      outline: color === opt.value ? `2px solid ${opt.hex}` : 'none',
                      outlineOffset: 2,
                      transition: 'outline 0.1s',
                    }}
                  />
                ))}
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: selectedColor.hex, alignSelf: 'center', marginLeft: 4 }}>
                  {selectedColor.label}
                </span>
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

            {/* Objetivo (oculto para easter_egg_all) */}
            {selectedCriteria.needsValue && (
              <div>
                <label style={labelStyle}>Objetivo (número) *</label>
                <input
                  name="criteriaValue"
                  type="number"
                  min={1}
                  required
                  defaultValue={
                    achievement?.criteriaType === criteriaType && achievement?.criteriaValue != null
                      ? Number(achievement.criteriaValue)
                      : criteriaType === 'level_reached' ? 2 : 5
                  }
                  style={{ ...inputStyle, width: 140 }}
                />
                {criteriaType === 'level_reached' && (
                  <div style={{ marginTop: 4, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
                    Niveles disponibles: 1 al 5
                  </div>
                )}
              </div>
            )}

            {!selectedCriteria.needsValue && (
              <div style={{
                padding: '12px 16px',
                background: 'color-mix(in srgb, var(--spore) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--spore) 30%, transparent)',
                borderRadius: 'var(--r-md)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--spore)',
                lineHeight: 1.5,
              }}>
                ✦ Este logro no requiere un número específico — se desbloquea al encontrar todos los easter eggs del sitio.
              </div>
            )}

            {/* Preview del logro */}
            <div>
              <label style={labelStyle}>Vista previa</label>
              <div style={{
                padding: '16px',
                background: 'color-mix(in srgb, var(--moss-800) 80%, transparent)',
                border: `1px solid color-mix(in srgb, ${selectedColor.hex} 40%, var(--border-soft))`,
                borderRadius: 'var(--r-lg)',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, color, lineHeight: 1, flexShrink: 0 }}>
                  {glyph}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    Nombre del logro
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>
                    Descripción del logro desbloqueado
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, marginTop: 6 }}>
                    {xp > 0 ? `+${xp} XP` : 'Sin XP'}  ·  {selectedCriteria.icon} {selectedCriteria.label}
                  </div>
                </div>
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
                {isPending ? 'Guardando…' : (achievement ? 'Actualizar logro →' : 'Crear logro →')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
