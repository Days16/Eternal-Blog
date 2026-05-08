'use client'

import { useTransition, useState } from 'react'
import { createRoleAction, updateRoleAction } from '@/app/admin/actions'

interface CustomRole {
  id: string
  name: string
  label: string
  description: string | null
  color: string
}

interface RoleFormProps {
  role?: CustomRole
}

const COLOR_OPTIONS = [
  { hex: '#d4a64a', css: 'var(--spore)',    label: 'Dorado' },
  { hex: '#c89b3c', css: 'var(--rune)',     label: 'Runa' },
  { hex: '#6e8bb8', css: 'var(--mist)',     label: 'Neblina' },
  { hex: '#7c4a8e', css: 'var(--amethyst)', label: 'Amatista' },
  { hex: '#a83232', css: 'var(--ember)',    label: 'Brasa' },
  { hex: '#4a7c59', css: '#4a7c59',         label: 'Bosque' },
  { hex: '#eef0f4', css: 'var(--moss-100)', label: 'Pergamino' },
]

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-soft)',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  background: 'var(--moss-900)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
}

export function RoleForm({ role }: RoleFormProps) {
  const isEdit = !!role
  const [isPending, startTransition] = useTransition()
  const [color, setColor] = useState(role?.color ?? 'var(--spore)')
  const [label, setLabel] = useState(role?.label ?? '')
  const [error, setError] = useState<string | null>(null)

  const colorHex = COLOR_OPTIONS.find(o => o.css === color)?.hex ?? '#d4a64a'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (isEdit) await updateRoleAction(fd)
        else await createRoleAction(fd)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
      {isEdit && <input type="hidden" name="id" value={role.id} />}
      <input type="hidden" name="color" value={color} />

      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'color-mix(in srgb, var(--ember) 12%, transparent)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--ember)',
        }}>
          {error}
        </div>
      )}

      {/* Identificador (solo en creación) */}
      {!isEdit && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>
            Identificador interno <span style={{ color: 'var(--ember)' }}>*</span>
          </label>
          <input
            name="name"
            required
            placeholder="oraculo"
            pattern="[a-z0-9_-]+"
            style={inputStyle}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
            Solo letras minúsculas, números y guiones. No se puede cambiar.
          </span>
        </div>
      )}

      {isEdit && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--moss-900)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-mute)',
        }}>
          ID: <span style={{ color: 'var(--text-soft)' }}>{role.name}</span>
        </div>
      )}

      {/* Etiqueta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>
          Etiqueta visible <span style={{ color: 'var(--ember)' }}>*</span>
        </label>
        <input
          name="label"
          required
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Oráculo"
          style={inputStyle}
        />
      </div>

      {/* Descripción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Descripción</label>
        <input
          name="description"
          defaultValue={role?.description ?? ''}
          placeholder="Descripción breve del rol (opcional)"
          style={inputStyle}
        />
      </div>

      {/* Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {COLOR_OPTIONS.map(opt => (
            <button
              key={opt.css}
              type="button"
              onClick={() => setColor(opt.css)}
              title={opt.label}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: opt.hex,
                border: color === opt.css ? '3px solid var(--text)' : '2px solid transparent',
                outline: color === opt.css ? `2px solid ${opt.hex}` : 'none',
                outlineOffset: 2,
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Vista previa del badge */}
        {label && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>Vista previa:</span>
            <span style={{
              padding: '3px 10px',
              borderRadius: 999,
              border: `1px solid ${colorHex}`,
              color,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              background: `color-mix(in srgb, ${colorHex} 12%, transparent)`,
            }}>
              {label}
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          alignSelf: 'flex-start',
          padding: '9px 22px',
          background: isPending ? 'transparent' : 'var(--spore)',
          border: '1px solid var(--spore)',
          borderRadius: 'var(--r-sm)',
          color: isPending ? 'var(--spore)' : 'var(--moss-900)',
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 700,
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
      </button>
    </form>
  )
}
