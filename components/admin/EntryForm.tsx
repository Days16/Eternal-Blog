'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { Btn } from '@/components/ui/Btn'
import { CODEX_CATEGORIES } from '@/lib/supabase/queries/entries'
import { saveEntryAction } from '@/app/admin/actions'

type EntryFormProps = {
  entry?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    type: 'chronicle' | 'codex'
    category: string | null
    tags: string
    body: string
    status: 'draft' | 'published' | 'archived'
  } | null
}

function tagsToText(tags?: string) {
  try { return JSON.parse(tags ?? '[]').join(', ') } catch { return '' }
}

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Btn type="submit" variant="rune" disabled={pending}>
      {pending ? 'Guardando…' : 'Guardar entrada'}
    </Btn>
  )
}

export function EntryForm({ entry }: EntryFormProps) {
  const [state, formAction] = useActionState(saveEntryAction, null)

  return (
    <form action={formAction} style={{ display: 'grid', gap: 18, maxWidth: 920 }}>
      {entry && <input type="hidden" name="id" value={entry.id} />}

      {state?.error && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(168,50,50,.15)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--ember)',
        }}>
          {state.error}
        </div>
      )}

      <label style={labelStyle}>Título<input name="title" defaultValue={entry?.title} required style={inputStyle} /></label>
      <label style={labelStyle}>Slug<input name="slug" defaultValue={entry?.slug} placeholder="se-autogenera-si-lo-dejas-vacio" style={inputStyle} /></label>
      <label style={labelStyle}>Extracto<textarea name="excerpt" defaultValue={entry?.excerpt ?? ''} rows={3} style={inputStyle} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <label style={labelStyle}>Tipo<select name="type" defaultValue={entry?.type ?? 'chronicle'} style={inputStyle}><option value="chronicle">Crónica</option><option value="codex">Codex</option></select></label>
        <label style={labelStyle}>Categoría<select name="category" defaultValue={entry?.category ?? ''} style={inputStyle}><option value="">—</option>{CODEX_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
        <label style={labelStyle}>Estado<select name="status" defaultValue={entry?.status ?? 'draft'} style={inputStyle}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
        <label style={labelStyle}>Tags<input name="tags" defaultValue={tagsToText(entry?.tags)} placeholder="diario, magia" style={inputStyle} /></label>
      </div>
      <TiptapEditor defaultValue={entry?.body} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <SubmitBtn />
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1 }
const inputStyle: React.CSSProperties = { background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', padding: 12, fontFamily: 'var(--font-body)', fontSize: 14, textTransform: 'none', letterSpacing: 0 }
