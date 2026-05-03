import { createAchievementAction } from '@/app/admin/actions'
import { Btn } from '@/components/ui/Btn'
import { getAdminAchievements } from '@/lib/supabase/queries/admin'

const CRITERIA = ['comment_count', 'reaction_given', 'entry_published', 'xp_total', 'easter_egg_found', 'easter_egg_all', 'level_reached']

export default async function AdminAchievementsPage() {
  const achievements = await getAdminAchievements()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Logros</h1>
      <form action={createAchievementAction} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 24 }}>
        <input name="name" placeholder="Nombre" required style={inputStyle} />
        <input name="slug" placeholder="slug" style={inputStyle} />
        <input name="description" placeholder="Descripción" style={inputStyle} />
        <input name="runeGlyph" placeholder="ᛟ" style={inputStyle} />
        <input name="color" placeholder="var(--spore)" style={inputStyle} />
        <select name="criteriaType" style={inputStyle}>{CRITERIA.map(c => <option key={c}>{c}</option>)}</select>
        <input name="criteriaValue" type="number" placeholder="Criterio" style={inputStyle} />
        <input name="xpReward" type="number" placeholder="XP bonus" style={inputStyle} />
        <Btn variant="rune">Crear logro</Btn>
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {achievements.map(a => <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16 }}><div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: a.color ?? 'var(--spore)' }}>{a.runeGlyph}</div><strong>{a.name}</strong><p style={{ color: 'var(--text-mute)', fontSize: 13 }}>{a.description}</p><small>{a.criteriaType} · {a.criteriaValue != null ? String(a.criteriaValue) : ''}</small></div>)}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text)', padding: 10 }
