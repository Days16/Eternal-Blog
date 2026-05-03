import { adjustUserXpAction, updateUserRoleAction } from '@/app/admin/actions'
import { Btn } from '@/components/ui/Btn'
import { getAdminUsers } from '@/lib/supabase/queries/admin'

const ROLES = ['visitor', 'reader', 'scribe', 'moderator', 'admin']

export default async function AdminUsersPage() {
  const users = await getAdminUsers()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Usuarios</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {users.map(user => (
          <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '1fr 220px 220px', gap: 16, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            <div><strong>{user.name ?? user.username}</strong><div style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{user.email} · Nv.{user.level} · {user.xp} XP</div></div>
            <form action={updateUserRoleAction} style={{ display: 'flex', gap: 8 }}><input type="hidden" name="id" value={user.id} /><select name="role" defaultValue={user.role ?? undefined} style={inputStyle}>{ROLES.map(role => <option key={role}>{role}</option>)}</select><Btn size="sm" variant="ghost">Rol</Btn></form>
            <form action={adjustUserXpAction} style={{ display: 'flex', gap: 8 }}><input type="hidden" name="id" value={user.id} /><input name="delta" type="number" placeholder="XP" style={inputStyle} /><Btn size="sm" variant="rune">Ajustar</Btn></form>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { minWidth: 0, background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)', padding: 8 }
