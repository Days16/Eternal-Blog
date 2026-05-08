import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminLayoutShell } from '@/components/layout/AdminLayoutShell'
import { requireRole } from '@/lib/auth/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('admin', 'moderator', 'dev')
  const role = (session.user as { role?: string }).role
  const chamberLabel = role === 'dev'
    ? 'DEV SANCTUM'
    : role === 'moderator'
      ? 'SALA DE MOD'
      : 'CÁMARA DEL ARCHIMAGO'

  return (
    <AdminLayoutShell sidebar={<AdminSidebar />} chamberLabel={chamberLabel}>
      {children}
    </AdminLayoutShell>
  )
}
