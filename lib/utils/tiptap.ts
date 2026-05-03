// Renderizador ligero de Tiptap JSON → HTML para Server Components.
// Suficiente para el contenido del editor (StarterKit + Image + Link).
// No requiere browser APIs.

interface TiptapMark {
  type: string
  attrs?: Record<string, string | number | boolean | null>
}

interface TiptapNode {
  type: string
  text?: string
  attrs?: Record<string, string | number | boolean | null>
  marks?: TiptapMark[]
  content?: TiptapNode[]
}

function applyMarks(text: string, marks: TiptapMark[] = []): string {
  let out = escapeHtml(text)
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':      out = `<strong>${out}</strong>`; break
      case 'italic':    out = `<em>${out}</em>`; break
      case 'code':      out = `<code>${out}</code>`; break
      case 'strike':    out = `<s>${out}</s>`; break
      case 'underline': out = `<u>${out}</u>`; break
      case 'highlight': out = `<mark>${out}</mark>`; break
      case 'link': {
        const href = escapeAttr(String(mark.attrs?.href ?? '#'))
        const rel  = 'noopener noreferrer'
        out = `<a href="${href}" rel="${rel}">${out}</a>`
        break
      }
    }
  }
  return out
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderNode).join('')

    case 'paragraph': {
      const inner = (node.content ?? []).map(renderNode).join('')
      return inner ? `<p>${inner}</p>` : '<p><br></p>'
    }

    case 'text':
      return applyMarks(node.text ?? '', node.marks)

    case 'hardBreak':
      return '<br>'

    case 'heading': {
      const level = Number(node.attrs?.level ?? 2)
      const inner = (node.content ?? []).map(renderNode).join('')
      return `<h${level}>${inner}</h${level}>`
    }

    case 'blockquote':
      return `<blockquote>${(node.content ?? []).map(renderNode).join('')}</blockquote>`

    case 'bulletList':
      return `<ul>${(node.content ?? []).map(renderNode).join('')}</ul>`

    case 'orderedList':
      return `<ol>${(node.content ?? []).map(renderNode).join('')}</ol>`

    case 'listItem':
      return `<li>${(node.content ?? []).map(renderNode).join('')}</li>`

    case 'codeBlock': {
      const lang  = node.attrs?.language ? ` class="language-${escapeAttr(String(node.attrs.language))}"` : ''
      const inner = escapeHtml((node.content?.[0]?.text) ?? '')
      return `<pre><code${lang}>${inner}</code></pre>`
    }

    case 'horizontalRule':
      return '<hr>'

    case 'image': {
      const src = escapeAttr(String(node.attrs?.src ?? ''))
      const alt = escapeAttr(String(node.attrs?.alt ?? ''))
      return `<img src="${src}" alt="${alt}" loading="lazy">`
    }

    default:
      return (node.content ?? []).map(renderNode).join('')
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function tiptapToHtml(json: string | TiptapNode | null | undefined): string {
  if (!json) return ''
  try {
    const doc: TiptapNode = typeof json === 'string' ? JSON.parse(json) : json
    return renderNode(doc)
  } catch {
    return typeof json === 'string' ? `<p>${escapeHtml(json)}</p>` : ''
  }
}

export function tiptapToText(json: string | TiptapNode | null | undefined): string {
  if (!json) return ''
  try {
    const doc: TiptapNode = typeof json === 'string' ? JSON.parse(json) : json
    return extractText(doc)
  } catch {
    return ''
  }
}

function extractText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(extractText).join(' ')
}

// Genera una lista plana de headings para el TOC
export function extractHeadings(json: string | TiptapNode | null | undefined): { level: number; text: string; id: string }[] {
  if (!json) return []
  try {
    const doc: TiptapNode = typeof json === 'string' ? JSON.parse(json) : json
    const headings: { level: number; text: string; id: string }[] = []
    walkNodes(doc, (node) => {
      if (node.type === 'heading') {
        const text = (node.content ?? []).map(n => n.text ?? '').join('')
        headings.push({ level: Number(node.attrs?.level ?? 2), text, id: slugifyText(text) })
      }
    })
    return headings
  } catch {
    return []
  }
}

function walkNodes(node: TiptapNode, fn: (n: TiptapNode) => void) {
  fn(node)
  for (const child of node.content ?? []) walkNodes(child, fn)
}

function slugifyText(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
