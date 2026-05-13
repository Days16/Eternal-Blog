import { Btn } from '@/components/ui/Btn'
import { saveRoadmapItemAction } from '@/app/admin/roadmap/actions'
import type { RoadmapItem } from '@/lib/supabase/queries/roadmap'
import Link from 'next/link'

const PHASE_OPTIONS = [
  { value: 'done',        label: '✦ Completado' },
  { value: 'in_progress', label: '◈ En forja' },
  { value: 'next',        label: '◇ Próximamente' },
  { value: 'future',      label: '○ En el horizonte' },
]

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--moss-900)',
  border: '1px solid var(--border-soft)',
  borderRadius: 'var(--r-sm)',
  padding: '9px 12px',
  color: 'var(--text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: 1.2,
  marginBottom: 6,
}

export function RoadmapForm({ item }: { item?: RoadmapItem | null }) {
  return (
    <form action={saveRoadmapItemAction} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {item && <input type="hidden" name="id" value={item.id} />}

      {/* Título */}
      <div>
        <label style={labelStyle} htmlFor="rm-title">Título *</label>
        <input
          id="rm-title"
          name="title"
          required
          defaultValue={item?.title ?? ''}
          placeholder="Ej.: Notificaciones en tiempo real"
          style={fieldStyle}
        />
      </div>

      {/* Descripción */}
      <div>
        <label style={labelStyle} htmlFor="rm-description">Descripción</label>
        <textarea
          id="rm-description"
          name="description"
          rows={3}
          defaultValue={item?.description ?? ''}
          placeholder="Breve descripción visible al público."
          style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
      </div>

      {/* Fase + Version tag */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle} htmlFor="rm-phase">Fase *</label>
          <select
            id="rm-phase"
            name="phase"
            defaultValue={item?.phase ?? 'next'}
            style={{ ...fieldStyle, cursor: 'pointer' }}
          >
            {PHASE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="rm-version">Versión (opcional)</label>
          <input
            id="rm-version"
            name="version_tag"
            defaultValue={item?.versionTag ?? ''}
            placeholder="v0.5"
            style={fieldStyle}
          />
        </div>
      </div>

      {/* Orden + Visible */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={labelStyle} htmlFor="rm-sort">Orden (menor = arriba)</label>
          <input
            id="rm-sort"
            name="sort_order"
            type="number"
            min={0}
            step={10}
            defaultValue={item?.sortOrder ?? 10}
            style={fieldStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 2 }}>
          <input
            id="rm-public"
            name="public"
            type="checkbox"
            defaultChecked={item?.public ?? true}
            style={{ width: 16, height: 16, accentColor: 'var(--spore)', cursor: 'pointer', flexShrink: 0 }}
          />
          <label htmlFor="rm-public" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Visible al público
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
        <Btn type="submit" variant="rune">
          {item ? 'Guardar cambios' : 'Crear ítem'}
        </Btn>
        <Link href="/admin/roadmap" style={{ textDecoration: 'none' }}>
          <Btn type="button" variant="ghost">Cancelar</Btn>
        </Link>
      </div>
    </form>
  )
}
