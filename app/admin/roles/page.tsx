import Link from 'next/link'

export default function AdminRolesPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 16px' }}>Roles</h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)' }}>La gestión de roles se realiza desde <Link href="/admin/usuarios" style={{ color: 'var(--spore)' }}>Usuarios</Link>.</p>
    </div>
  )
}
