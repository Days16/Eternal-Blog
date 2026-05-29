'use client'

import { useTransition, useState } from 'react'
import { createRoleAction, updateRoleAction } from '@/app/admin/actions'

interface CustomRole {
  id: string
  name: string
  label: string
  description: string | null
  color: string
  permissions?: string[]
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

const PERMISSION_GROUPS: { label: string; items: { key: string; name: string; desc: string }[] }[] = [
  {
    label: 'Contenido',
    items: [
      { key: 'read_posts',     name: 'Leer entradas',       desc: 'Leer entradas de blog y codex' },
      { key: 'write_comments', name: 'Escribir comentarios', desc: 'Publicar y responder comentarios' },
      { key: 'react_entries',  name: 'Reaccionar',           desc: 'Reaccionar a publicaciones con emojis' },
      { key: 'write_posts',    name: 'Crear entradas',       desc: 'Crear entradas en modo borrador (Escriba)' },
      { key: 'publish_posts',  name: 'Publicar entradas',    desc: 'Publicar entradas directamente sin revisión' },
    ],
  },
  {
    label: 'Moderación',
    items: [
      { key: 'moderate_comments', name: 'Moderar comentarios', desc: 'Eliminar o sellar comentarios de otros usuarios' },
      { key: 'manage_users',      name: 'Gestionar usuarios',   desc: 'Editar roles, XP y datos de usuarios' },
    ],
  },
  {
    label: 'Tienda y gamificación',
    items: [
      { key: 'manage_marketplace',  name: 'Gestionar tienda',       desc: 'Editar catálogo, stock y pedidos' },
      { key: 'manage_gamification', name: 'Gestionar gamificación',  desc: 'Crear y editar misiones y logros' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { key: 'access_admin',    name: 'Acceso al panel admin', desc: 'Ver el panel de administración' },
      { key: 'configure_system', name: 'Configurar sistema',   desc: 'Cambiar textos, tema y ajustes globales' },
    ],
  },
]

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key))

const TEMPLATES: { label: string; permissions: string[] }[] = [
  {
    label: 'Escriba',
    permissions: ['read_posts', 'write_comments', 'react_entries', 'write_posts'],
  },
  {
    label: 'Moderador',
    permissions: ['read_posts', 'write_comments', 'react_entries', 'write_posts', 'moderate_comments', 'access_admin'],
  },
  {
    label: 'Administrador',
    permissions: ALL_PERMISSIONS,
  },
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
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set(role?.permissions ?? []))
  const [error, setError] = useState<string | null>(null)

  const colorHex = COLOR_OPTIONS.find(o => o.css === color)?.hex ?? '#d4a64a'

  function togglePerm(key: string) {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function applyTemplate(perms: string[]) {
    setSelectedPerms(new Set(perms))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    // Asegurar que los permisos marcados estén en el FormData
    selectedPerms.forEach(p => fd.append('permissions', p))
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 580 }}>
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
                width: 28, height: 28, borderRadius: '50%',
                background: opt.hex,
                border: color === opt.css ? '3px solid var(--text)' : '2px solid transparent',
                outline: color === opt.css ? `2px solid ${opt.hex}` : 'none',
                outlineOffset: 2,
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            />
          ))}
        </div>

        {label && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>Vista previa:</span>
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              border: `1px solid ${colorHex}`,
              color, fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
              background: `color-mix(in srgb, ${colorHex} 12%, transparent)`,
            }}>
              {label}
            </span>
          </div>
        )}
      </div>

      {/* ── Permisos ────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={labelStyle}>Permisos asociados a este rol</span>
          {/* Plantillas rápidas */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyTemplate(tpl.permissions)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--spore)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--spore) 10%, transparent)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                title={`Cargar plantilla: ${tpl.label}`}
              >
                ⚡ {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--moss-900)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {PERMISSION_GROUPS.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <div style={{ height: 1, background: 'var(--border-soft)' }} />}
              <div style={{ padding: '10px 16px 6px', fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)' }}>
                {group.label}
              </div>
              {group.items.map(item => {
                const checked = selectedPerms.has(item.key)
                return (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '9px 16px', cursor: 'pointer',
                      background: checked ? 'color-mix(in srgb, var(--spore) 4%, transparent)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (!checked) (e.currentTarget as HTMLElement).style.background = 'var(--moss-800)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = checked ? 'color-mix(in srgb, var(--spore) 4%, transparent)' : 'transparent'
                    }}
                  >
                    <div style={{
                      marginTop: 2,
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${checked ? 'var(--spore)' : 'var(--border)'}`,
                      background: checked ? 'var(--spore)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && <span style={{ color: 'var(--moss-900)', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    <input
                      type="checkbox"
                      name="permissions_ui"
                      value={item.key}
                      checked={checked}
                      onChange={() => togglePerm(item.key)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? 'var(--text)' : 'var(--text-soft)', lineHeight: 1.3 }}>
                        {item.name}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', marginLeft: 8 }}>
                          {item.key}
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-mute)', marginTop: 1, lineHeight: 1.4 }}>
                        {item.desc}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
          {selectedPerms.size} de {ALL_PERMISSIONS.length} permisos seleccionados
        </div>
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
