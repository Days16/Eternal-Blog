'use client'

import { useActionState, useRef, useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { sanitizeCommentHtml, stripHtml } from '@/lib/utils/sanitize'
import { createReplyAction } from '@/app/foro/actions'

interface Props {
  threadId: string
  categorySlug: string
  threadSlug: string
  parentId?: string | null
  onCancel?: () => void
  compact?: boolean
}

const FORMATS = [
  { label: 'Negrita', open: '<strong>', close: '</strong>' },
  { label: 'Cursiva', open: '<em>', close: '</em>' },
  { label: 'Cita', open: '<blockquote>', close: '</blockquote>' },
  { label: 'Código', open: '<code>', close: '</code>' },
]

export function ReplyForm({ threadId, categorySlug, threadSlug, parentId = null, onCancel, compact = false }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [error, dispatch, isPending] = useActionState(createReplyAction, null)

  const preview = sanitizeCommentHtml(body)
  const hasContent = stripHtml(preview).replaceAll('&nbsp;', '').trim().length > 0

  function wrapSelection(open: string, close: string) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end) || 'texto'
    const next = `${body.slice(0, start)}${open}${selected}${close}${body.slice(end)}`
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + open.length, start + open.length + selected.length)
    })
  }

  function handleSubmit(formData: FormData) {
    formData.set('body', body)
    dispatch(formData)
    setBody('')
  }

  return (
    <form action={handleSubmit} style={{
      background: compact ? 'var(--moss-800)' : 'var(--bg-card)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-lg)',
      padding: compact ? 14 : 20,
    }}>
      <input type="hidden" name="thread_id" value={threadId} />
      <input type="hidden" name="category_slug" value={categorySlug} />
      <input type="hidden" name="thread_slug" value={threadSlug} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {FORMATS.map(f => (
          <button
            key={f.label}
            type="button"
            onClick={() => wrapSelection(f.open, f.close)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--text-soft)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              padding: '5px 8px',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={body}
        onChange={e => setBody(e.target.value.slice(0, 2000))}
        placeholder={parentId ? 'Escribe tu respuesta…' : 'Escribe tu mensaje…'}
        rows={compact ? 3 : 5}
        style={{
          width: '100%',
          resize: 'vertical',
          background: 'var(--moss-900)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          lineHeight: 1.6,
          padding: 14,
          outline: 'none',
        }}
      />

      {body && (
        <div style={{
          marginTop: 12,
          padding: 12,
          border: '1px dashed var(--border-soft)',
          borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 8 }}>
            Vista previa
          </div>
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, color: 'var(--ember)', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
        {onCancel && (
          <Btn type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Btn>
        )}
        <Btn
          type="submit"
          variant="rune"
          size="sm"
          disabled={!hasContent || isPending}
          style={{ opacity: !hasContent || isPending ? 0.55 : 1 }}
        >
          {isPending ? 'Enviando…' : 'Responder'}
        </Btn>
      </div>
    </form>
  )
}
