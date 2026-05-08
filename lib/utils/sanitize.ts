import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'blockquote', 'code', 'a'])

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function sanitizeUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') return url.toString()
  } catch {
    if (value.startsWith('/')) return value
  }
  return '#'
}

export function sanitizeCommentHtml(input: string) {
  const clipped = input.trim().slice(0, 2000)
  const placeholders: string[] = []
  const protectedHtml = clipped.replace(/<a\s+[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_match, _quote, href, text) => {
    const safeHref = sanitizeUrl(String(href))
    const safeText = escapeHtml(String(text).replace(/<[^>]*>/g, ''))
    const index = placeholders.push(`<a href="${safeHref}" rel="noopener" target="_blank">${safeText}</a>`) - 1
    return `__COMMENT_LINK_${index}__`
  })

  let safe = escapeHtml(protectedHtml)

  for (const tag of ALLOWED_TAGS) {
    if (tag === 'a') continue
    safe = safe
      .replaceAll(`&lt;${tag}&gt;`, `<${tag}>`)
      .replaceAll(`&lt;/${tag}&gt;`, `</${tag}>`)
  }

  placeholders.forEach((html, index) => {
    safe = safe.replaceAll(`__COMMENT_LINK_${index}__`, html)
  })

  return safe.replace(/\n{3,}/g, '\n\n').replaceAll('\n', '<br />')
}

export function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, '').trim()
}

export function sanitizeForDisplay(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'blockquote', 'code', 'a', 'br', 'p'],
    ALLOWED_ATTR: ['href', 'rel', 'target'],
    ALLOW_DATA_ATTR: false,
  })
}
