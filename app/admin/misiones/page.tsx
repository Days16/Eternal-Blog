import { createMissionAction } from '@/app/admin/actions'
import { Btn } from '@/components/ui/Btn'
import { getAdminMissions } from '@/lib/supabase/queries/admin'
import { formatDate } from '@/lib/utils/dates'

export default async function AdminMissionsPage() {
  const missions = await getAdminMissions()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Misiones</h1>
      <form action={createMissionAction} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 24 }}>
        <input name="title" placeholder="Título" required style={inputStyle} />
        <input name="description" placeholder="Descripción" style={inputStyle} />
        <input name="criteriaType" placeholder="comment_count" style={inputStyle} />
        <input name="criteriaValue" type="number" placeholder="Objetivo" style={inputStyle} />
        <input name="xpReward" type="number" placeholder="XP" style={inputStyle} />
        <input name="startsAt" type="datetime-local" style={inputStyle} />
        <input name="endsAt" type="datetime-local" style={inputStyle} />
        <Btn variant="rune">Crear misión</Btn>
      </form>
      <div style={{ display: 'grid', gap: 12 }}>
        {missions.map(mission => <div key={mission.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16 }}><strong>{mission.title}</strong><p style={{ color: 'var(--text-mute)' }}>{mission.description}</p><small>{mission.criteriaType} · {mission.criteriaValue} · {mission.xpReward} XP · {formatDate(mission.startsAt)} → {formatDate(mission.endsAt)}</small></div>)}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)', padding: 10 }
