'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Btn } from '@/components/ui/Btn'
import { sanitizeCommentHtml, stripHtml } from '@/lib/utils/sanitize'

type CommentFormProps = {
  entryId: string
  parentId?: string | null
  onCancel?: () => void
  onCreated?: () => void
  compact?: boolean
}

const FORMATS = [
  { label: 'Negrita', open: '<strong>', close: '</strong>' },
  { label: 'Cursiva', open: '<em>', close: '</em>' },
  { label: 'Cita', open: '<blockquote>', close: '</blockquote>' },
  { label: 'Código', open: '<code>', close: '</code>' },
]

export function CommentForm({ entryId, parentId = null, onCancel, onCreated, compact = false }: CommentFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const preview = useMemo(() => sanitizeCommentHtml(body), [body])
  const hasContent = stripHtml(preview).replaceAll('&nbsp;', '').trim().length > 0

  function wrapSelection(open: string, close: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = body.slice(start, end) || 'texto'
    const next = `${body.slice(0, start)}${open}${selected}${close}${body.slice(end)}`
    setBody(next)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + open.length, start + open.length + selected.length)
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasContent || submitting) return
    setSubmitting(true)
    setError(null)

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, parentId, body }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(typeof payload.error === 'string' ? payload.error : 'No se pudo lacrar el comentario')
      setSubmitting(false)
      return
    }

    setBody('')
    setSent(true)
    setSubmitting(false)
    router.refresh()
    onCreated?.()
    window.setTimeout(() => setSent(false), 900)
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: compact ? 'var(--moss-800)' : 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: compact ? 16 : 22 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {FORMATS.map(format => (
          <button
            key={format.label}
            type="button"
            onClick={() => wrapSelection(format.open, format.close)}
            style={{ background: 'transparent', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-sm)', color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 11, padding: '5px 8px' }}
          >
            {format.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={body}
        onChange={event => setBody(event.target.value.slice(0, 2000))}
        placeholder="Lacra tu palabra aquí…"
        rows={compact ? 3 : 5}
        style={{ width: '100%', resize: 'vertical', background: 'var(--moss-900)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, padding: 14, outline: 'none' }}
      />

      {body && (
        <div style={{ marginTop: 14, padding: 14, border: '1px dashed var(--border-soft)', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 8 }}>
            Vista previa
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}

      {error && <div style={{ marginTop: 10, color: 'var(--ember)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>{error}</div>}
      {sent && <div style={{ marginTop: 10, color: 'var(--spore)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>🕯️ Sello lacrado.</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
        {onCancel && <Btn type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Btn>}
        <Btn type="submit" variant="rune" size="sm" disabled={!hasContent || submitting} style={{ opacity: !hasContent || submitting ? 0.55 : 1 }}>
          {submitting ? 'Sellando…' : parentId ? 'Responder' : 'Lacrar palabra'}
        </Btn>
      </div>
    </form>
  )
}
