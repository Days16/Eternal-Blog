import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RoleForm } from '@/components/admin/RoleForm'
import { getCustomRoles } from '@/lib/supabase/queries/admin'

type Props = { params: Promise<{ id: string }> }

export default async function EditarRolPage({ params }: Props) {
  const { id } = await params
  const roles = await getCustomRoles()
  const role = roles.find(r => r.id === id)
  if (!role) notFound()

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
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', margin: '0 0 4px' }}>
        Editar rol
      </h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mute)', margin: '0 0 28px' }}>
        {role.label}
      </p>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 32px',
      }}>
        <RoleForm role={role} />
      </div>
    </div>
  )
}
