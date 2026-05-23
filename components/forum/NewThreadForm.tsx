'use client'

import { useActionState, useRef, useState } from 'react'
import { Btn } from '@/components/ui/Btn'
import { EmojiPicker } from '@/components/ui/EmojiPicker'
import { sanitizeCommentHtml, stripHtml } from '@/lib/utils/sanitize'
import { createThreadAction } from '@/app/foro/actions'

interface Props {
  categoryId: string
  categorySlug: string
}

const FORMATS = [
  { label: 'Negrita', open: '<strong>', close: '</strong>' },
  { label: 'Cursiva', open: '<em>', close: '</em>' },
  { label: 'Cita', open: '<blockquote>', close: '</blockquote>' },
  { label: 'Código', open: '<code>', close: '</code>' },
]

export function NewThreadForm({ categoryId, categorySlug }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [error, dispatch, isPending] = useActionState(createThreadAction, null)

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

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    const pos = el ? el.selectionStart : body.length
    const next = `${body.slice(0, pos)}${emoji}${body.slice(pos)}`
    setBody(next.slice(0, 8000))
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(pos + emoji.length, pos + emoji.length) })
  }

  function handleSubmit(formData: FormData) {
    formData.set('body', body)
    dispatch(formData)
  }

  return (
    <form action={handleSubmit} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-lg)',
      padding: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="category_slug" value={categorySlug} />

      <div>
        <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)', display: 'block', marginBottom: 8 }}>
          Título del hilo
        </label>
        <input
          type="text"
          name="title"
          required
          minLength={5}
          maxLength={200}
          placeholder="¿De qué trata este pergamino?"
          style={{
            width: '100%',
            background: 'var(--moss-900)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            padding: '12px 16px',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)', display: 'block', marginBottom: 8 }}>
          Contenido
        </label>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <EmojiPicker onSelect={insertEmoji} />
        </div>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value.slice(0, 8000))}
          placeholder="Escribe el contenido del hilo…"
          rows={8}
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
      </div>

      {body && (
        <div style={{
          padding: 16,
          border: '1px dashed var(--border-soft)',
          borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 10 }}>
            Vista previa
          </div>
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--ember)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn
          type="submit"
          variant="rune"
          disabled={!hasContent || isPending}
          style={{ opacity: !hasContent || isPending ? 0.55 : 1 }}
        >
          {isPending ? 'Publicando…' : 'Publicar hilo'}
        </Btn>
      </div>
    </form>
  )
}
