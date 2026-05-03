import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { requireRole } from '@/lib/auth/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin', 'moderator')
  return (
    <div style={{ display: 'flex', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <AdminSidebar />
      <main style={{ flex: 1, padding: 32, minWidth: 0 }}>{children}</main>
    </div>
  )
}
