import Link from 'next/link'
import {
  adjustUserXpAction,
  createRoleAction,
  deleteRoleAction,
  updateRoleAction,
  updateUserRoleAction,
} from '@/app/admin/actions'
import { Btn } from '@/components/ui/Btn'
import { Pagination } from '@/components/admin/Pagination'
import { getAdminUsers, getCustomRoles } from '@/lib/supabase/queries/admin'

type Props = { searchParams: Promise<{ edit?: string; page?: string }> }

const SYSTEM_ROLES = [
  { name: 'visitor',   label: 'Visitante',  color: 'var(--text-mute)' },
  { name: 'reader',    label: 'Lector',     color: 'var(--mist)' },
  { name: 'scribe',    label: 'Escriba',    color: 'var(--spore)' },
  { name: 'moderator', label: 'Moderador',  color: 'var(--amethyst)' },
  { name: 'dev',       label: 'Dev',        color: 'var(--spore)' },
  { name: 'admin',     label: 'Admin',      color: 'var(--ember)' },
]

export default async function AdminUsersPage({ searchParams }: Props) {
  const { edit, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const [usersResult, customRoles] = await Promise.all([getAdminUsers({ page }), getCustomRoles()])
  const { rows: users, total, pageSize } = usersResult

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 32px' }}>Usuarios</h1>

      {/* ── Gestión de roles ──────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={sectionHeadStyle}>Roles</h2>

        {/* Roles del sistema (sólo lectura) */}
        <div style={{ marginBottom: 20 }}>
          <p style={mutedLabel}>Roles del sistema · no editables</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SYSTEM_ROLES.map(r => (
              <div key={r.name} style={{ ...rolePill, borderColor: r.color }}>
                <span style={{ color: r.color, fontWeight: 600, fontSize: 12 }}>{r.label}</span>
                <span style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{r.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roles personalizados */}
        {customRoles.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
            <p style={mutedLabel}>Roles personalizados</p>
            {customRoles.map(role => (
              edit === role.id ? (
                /* Formulario de edición inline */
                <form key={role.id} action={updateRoleAction}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 140px auto auto', gap: 8, alignItems: 'end', background: 'var(--moss-700)', border: '1px solid var(--spore)', borderRadius: 'var(--r-lg)', padding: '12px 16px' }}>
                  <input type="hidden" name="id" value={role.id} />
                  <label style={labelStyle}>
                    Nombre visible
                    <input name="label" defaultValue={role.label} required style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    Descripción
                    <input name="description" defaultValue={role.description ?? ''} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    Color (CSS var o hex)
                    <input name="color" defaultValue={role.color} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    Identificador
                    <input value={role.name} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                  </label>
                  <Btn type="submit" variant="rune" size="sm">Guardar</Btn>
                  <Link href="/admin/usuarios">
                    <Btn variant="ghost" size="sm">Cancelar</Btn>
                  </Link>
                </form>
              ) : (
                /* Vista de rol */
                <div key={role.id}
                  style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto auto', gap: 16, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: role.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{role.label}</span>
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>{role.name}</span>
                    {role.description && (
                      <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--text-soft)' }}>{role.description}</span>
                    )}
                  </div>
                  <Link href={`/admin/usuarios?edit=${role.id}`}>
                    <Btn variant="ghost" size="sm">Editar</Btn>
                  </Link>
                  <form action={deleteRoleAction} onSubmit={undefined}
                    style={{ display: 'contents' }}>
                    <input type="hidden" name="id" value={role.id} />
                    <input type="hidden" name="name" value={role.name} />
                    <Btn type="submit" variant="ghost" size="sm"
                      style={{ color: 'var(--ember)', borderColor: 'var(--ember)' }}>
                      Eliminar
                    </Btn>
                  </form>
                </div>
              )
            ))}
          </div>
        )}

        {/* Formulario: nuevo rol */}
        <details style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: '12px 16px' }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--spore)', userSelect: 'none' }}>
            + Añadir nuevo rol
          </summary>
          <form action={createRoleAction}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 140px auto', gap: 8, alignItems: 'end', marginTop: 16 }}>
            <label style={labelStyle}>
              Identificador <span style={{ color: 'var(--ember)' }}>*</span>
              <input name="name" placeholder="oraculo" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Nombre visible <span style={{ color: 'var(--ember)' }}>*</span>
              <input name="label" placeholder="Oráculo" required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Descripción
              <input name="description" placeholder="Rol especial de sabios" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Color
              <input name="color" placeholder="var(--spore)" defaultValue="var(--spore)" style={inputStyle} />
            </label>
            <Btn type="submit" variant="rune" size="sm">Crear</Btn>
          </form>
        </details>
      </section>

      {/* ── Lista de usuarios ────────────────────────────── */}
      <section>
        <h2 style={sectionHeadStyle}>Cuentas</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {users.map(user => (
            <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '1fr 240px 200px', gap: 16, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16 }}>
              <div>
                <strong style={{ fontFamily: 'var(--font-body)' }}>{user.name ?? user.username}</strong>
                <div style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 2 }}>
                  {user.email} · Nv.{user.level} · {user.xp} XP
                </div>
              </div>
              <form action={updateUserRoleAction} style={{ display: 'flex', gap: 8 }}>
                <input type="hidden" name="id" value={user.id} />
                <select name="role" defaultValue={user.role ?? undefined} style={{ ...inputStyle, flex: 1 }}>
                  {SYSTEM_ROLES.map(r => <option key={r.name} value={r.name}>{r.label}</option>)}
                  {customRoles.map(r => <option key={r.name} value={r.name}>{r.label}</option>)}
                </select>
                <Btn type="submit" size="sm" variant="ghost">Guardar</Btn>
              </form>
              <form action={adjustUserXpAction} style={{ display: 'flex', gap: 8 }}>
                <input type="hidden" name="id" value={user.id} />
                <input name="delta" type="number" placeholder="+/- XP" style={{ ...inputStyle, flex: 1 }} />
                <Btn type="submit" size="sm" variant="rune">Ajustar</Btn>
              </form>
            </div>
          ))}
        </div>
        <Pagination page={page} total={total} pageSize={pageSize} basePath="/admin/usuarios" />
      </section>
    </div>
  )
}

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 24,
  margin: '0 0 16px',
  letterSpacing: -0.3,
}

const mutedLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: 1,
  margin: '0 0 8px',
}

const rolePill: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '6px 12px',
  background: 'var(--bg-card)',
  border: '1px solid',
  borderRadius: 'var(--r-md)',
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: 1,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--moss-950)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--text)',
  padding: 8,
  fontFamily: 'var(--font-body)',
  fontSize: 13,
}
