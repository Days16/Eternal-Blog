'use client'

import { useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'

type TiptapEditorProps = {
  name?: string
  defaultValue?: string
}

function parseInitialContent(value?: string) {
  if (!value) return undefined
  try {
    const doc = JSON.parse(value)
    if (doc && doc.type === 'doc') return doc
  } catch { /* noop */ }
  return undefined
}

export function TiptapEditor({ name = 'body', defaultValue }: TiptapEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
      Placeholder.configure({ placeholder: 'El pergamino está esperando…' }),
    ],
    content: parseInitialContent(defaultValue),
    onUpdate: ({ editor }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = JSON.stringify(editor.getJSON())
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    immediatelyRender: false,
  })

  const getDefaultJson = useCallback(() => {
    if (!defaultValue) return '{}'
    try {
      const doc = JSON.parse(defaultValue)
      if (doc && doc.type === 'doc') return defaultValue
    } catch { /* noop */ }
    return defaultValue
  }, [defaultValue])

  const setLink = useCallback(() => {
    const url = window.prompt('URL del enlace:')
    if (!url || !editor) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap',
        background: 'var(--moss-800)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md) var(--r-md) 0 0', padding: '8px 12px',
      }}>
        <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrita">B</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Cursiva" style={{ fontStyle: 'italic' }}>I</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título H2">H2</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Título H3">H3</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Lista">≡</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Lista numerada">1.</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Cita">❝</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Código inline">{'{}'}</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Bloque de código">▤</ToolBtn>
        <Divider />
        <ToolBtn onClick={setLink} active={editor?.isActive('link')} title="Enlace">↗</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Separador">—</ToolBtn>
      </div>

      {/* Editor área */}
      <div style={{
        background: 'var(--moss-950)', border: '1px solid var(--border)',
        borderTop: 'none', borderRadius: '0 0 var(--r-md) var(--r-md)',
        padding: 16, minHeight: 280,
        fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text)', lineHeight: 1.65,
      }}>
        <EditorContent editor={editor} />
      </div>

      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={getDefaultJson()}
      />
    </div>
  )
}

function ToolBtn({
  onClick, active, title, style, children,
}: {
  onClick?: () => void
  active?: boolean | null
  title?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'var(--moss-600)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: 4,
        color: active ? 'var(--spore)' : 'var(--text-soft)',
        cursor: 'pointer',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 8px',
        lineHeight: 1,
        transition: 'all 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span style={{ width: 1, height: 20, background: 'var(--border-soft)', margin: '0 2px', alignSelf: 'center' }} />
  )
}
