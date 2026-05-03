import { tiptapToHtml } from '@/lib/utils/tiptap'

interface EntryBodyProps {
  body: string
}

export function EntryBody({ body }: EntryBodyProps) {
  const html = tiptapToHtml(body)

  return (
    <div
      className="entry-body"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 19,
        lineHeight: 1.75,
        color: 'var(--text-soft)',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}
    />
  )
}
