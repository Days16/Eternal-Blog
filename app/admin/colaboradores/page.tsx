import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { isModeratorOrAbove } from '@/lib/auth/roles'
import { getCollaboratorApplications } from '@/lib/supabase/queries/collaborator'
import { CollaboratorReviewButtons } from './CollaboratorReviewButtons'

type Props = { searchParams: Promise<{ status?: string }> }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pendiente', color: 'var(--spore)' },
  accepted: { label: 'Aceptado',  color: 'var(--mist)' },
  rejected: { label: 'Rechazado', color: 'var(--ember)' },
}

export default async function AdminColaboradoresPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session?.user || !isModeratorOrAbove(session.user.role)) redirect('/admin')

  const { status } = await searchParams
  const filter = (status === 'accepted' || status === 'rejected') ? status : 'pending'
  const applications = await getCollaboratorApplications(filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, margin: '0 0 6px' }}>
            Solicitudes de Colaboración
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontSize: 14, margin: 0 }}>
            Gestiona las postulaciones al rango Colaborador.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['pending', 'accepted', 'rejected'] as const).map(s => (
          <a
            key={s}
            href={`/admin/colaboradores?status=${s}`}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-ui)', fontSize: 12,
              background: filter === s ? STATUS_LABELS[s].color : 'var(--moss-800)',
              color: filter === s ? 'var(--moss-900)' : 'var(--text-mute)',
              textDecoration: 'none', fontWeight: filter === s ? 600 : 400,
              border: `1px solid ${filter === s ? STATUS_LABELS[s].color : 'var(--border)'}`,
            }}
          >
            {STATUS_LABELS[s].label}
          </a>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic', margin: 0 }}>
            No hay solicitudes {STATUS_LABELS[filter].label.toLowerCase()}s.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map(app => (
            <article key={app.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                    {app.user?.name ?? app.user?.username ?? 'Usuario desconocido'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
                    @{app.user?.username ?? '—'} · {app.user?.email ?? '—'} · {app.createdAt?.toLocaleDateString('es-ES') ?? '—'}
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 99,
                  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
                  background: `${STATUS_LABELS[app.status].color}18`,
                  color: STATUS_LABELS[app.status].color,
                  border: `1px solid ${STATUS_LABELS[app.status].color}44`,
                }}>
                  {STATUS_LABELS[app.status].label}
                </span>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-soft)', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                {app.motivation}
              </p>

              {app.portfolio && (
                <a href={app.portfolio} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mist)', textDecoration: 'none', display: 'block', marginBottom: 16 }}>
                  🔗 {app.portfolio}
                </a>
              )}

              {app.status === 'pending' && (
                <CollaboratorReviewButtons appId={app.id} />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
