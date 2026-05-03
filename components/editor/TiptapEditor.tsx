'use client'

import { useMemo, useState } from 'react'

type TiptapEditorProps = {
  name?: string
  defaultValue?: string
}

function textFromTiptap(value?: string) {
  if (!value) return ''
  try {
    const doc = JSON.parse(value) as { content?: Array<{ content?: Array<{ text?: string }> }> }
    return (doc.content ?? []).map(node => (node.content ?? []).map(child => child.text ?? '').join('')).join('\n\n')
  } catch {
    return value
  }
}

export function TiptapEditor({ name = 'body', defaultValue }: TiptapEditorProps) {
  const [value, setValue] = useState(() => textFromTiptap(defaultValue))
  const preview = useMemo(() => value.split(/\n{2,}/).filter(Boolean), [value])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)' }}>
        <span>Editor ligero compatible con JSON Tiptap</span>
        <span>·</span>
        <span>separa párrafos con línea en blanco</span>
      </div>
      <textarea name={name} value={value} onChange={event => setValue(event.target.value)} rows={18} style={{ width: '100%', resize: 'vertical', background: 'var(--moss-950)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', padding: 16, fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.65 }} />
      <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-soft)', borderRadius: 'var(--r-md)', padding: 16 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Preview</div>
        {preview.length === 0 ? <p style={{ color: 'var(--text-mute)', fontStyle: 'italic' }}>El pergamino está vacío.</p> : preview.map((paragraph, index) => <p key={index} style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)', lineHeight: 1.6 }}>{paragraph}</p>)}
      </div>
    </div>
  )
}
