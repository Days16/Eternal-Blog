import Link from 'next/link'
import { RoleForm } from '@/components/admin/RoleForm'

export default function NuevoRolPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/roles"
          style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)', textDecoration: 'none' }}
        >
          ← Roles & permisos
        </Link>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', margin: '0 0 28px' }}>
        Nuevo rol
      </h1>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 32px',
      }}>
        <RoleForm />
      </div>
    </div>
  )
}
