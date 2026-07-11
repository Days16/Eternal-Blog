import Link from 'next/link'
import { Btn } from '@/components/ui/Btn'
import { getCustomRoles } from '@/lib/supabase/queries/admin'
import { DeleteRoleButton } from '@/components/admin/DeleteRoleButton'
import { getSession } from '@/lib/auth/session'

const BUILTIN_ROLES = [
  { name: 'visitor',   label: 'Visitante',    desc: 'Solo lectura, sin cuenta registrada',                color: 'var(--text-mute)' },
  { name: 'reader',    label: 'Lector',       desc: 'Cuenta registrada, puede comentar y reaccionar',     color: 'var(--mist)' },
  { name: 'scribe',    label: 'Escriba',      desc: 'Puede crear entradas en modo borrador',              color: 'var(--spore)' },
  { name: 'moderator', label: 'Moderador',    desc: 'Gestiona comentarios y usuarios',                    color: 'var(--amethyst)' },
  { name: 'admin',     label: 'Admin',        desc: 'Acceso completo al panel de administración',         color: 'var(--ember)' },
  { name: 'dev',       label: 'Desarrollador',desc: 'Acceso de depuración y configuración del sistema',   color: 'var(--rune)' },
]

export default async function AdminRolesPage() {
  const [customRoles, session] = await Promise.all([getCustomRoles(), getSession()])
  // Solo 'admin' puede reasignar roles o gestionar roles personalizados.
  const canManageRoles = session?.user?.role === 'admin'

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 4px' }}>
            Roles & permisos
          </h1>
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
            Roles del sistema y roles personalizados para la comunidad
          </p>
        </div>
        {canManageRoles && (
          <Link href="/admin/roles/nuevo">
            <Btn variant="rune">+ Nuevo rol</Btn>
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Roles integrados',     value: BUILTIN_ROLES.length,  color: 'var(--text-mute)' },
          { label: 'Roles personalizados', value: customRoles.length,    color: 'var(--spore)' },
          { label: 'Total de roles',       value: BUILTIN_ROLES.length + customRoles.length, color: 'var(--mist)' },
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

      {/* Roles integrados */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 14 }}>
          Roles integrados — de solo lectura
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {BUILTIN_ROLES.map(role => (
            <div key={role.name} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: `color-mix(in srgb, ${role.color} 15%, transparent)`,
                border: `1px solid ${role.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                color: role.color,
              }}>
                {role.label.charAt(0)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: role.color }}>
                  {role.label}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', marginTop: 2, lineHeight: 1.3 }}>
                  {role.desc}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--text-mute)',
                border: '1px solid var(--border-soft)',
                borderRadius: 4,
                padding: '2px 6px',
                flexShrink: 0,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {role.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles personalizados */}
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 14 }}>
          Roles personalizados ({customRoles.length})
        </div>

        {customRoles.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: '36px 24px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            color: 'var(--text-mute)',
          }}>
            No hay roles personalizados aún.{' '}
            <Link href="/admin/roles/nuevo" style={{ color: 'var(--spore)', textDecoration: 'none' }}>
              Crear el primero →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {customRoles.map(role => {
              const colorHex = role.color.startsWith('#') ? role.color : '#d4a64a'
              return (
                <div key={role.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `color-mix(in srgb, ${colorHex} 15%, transparent)`,
                      border: `1px solid ${colorHex}60`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      color: role.color,
                    }}>
                      {role.label.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: role.color }}>
                          {role.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-mute)',
                          border: '1px solid var(--border-soft)',
                          borderRadius: 4,
                          padding: '1px 5px',
                        }}>
                          {role.name}
                        </span>
                      </div>
                      {role.description && (
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', marginTop: 4, lineHeight: 1.3 }}>
                          {role.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  {canManageRoles && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/admin/roles/${role.id}`}
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
                        }}
                      >
                        Editar
                      </Link>
                      <DeleteRoleButton id={role.id} name={role.name} label={role.label} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
