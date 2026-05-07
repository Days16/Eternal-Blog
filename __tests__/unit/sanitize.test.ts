import { describe, it, expect } from 'vitest'
import { sanitizeCommentHtml, sanitizeForDisplay, stripHtml } from '@/lib/utils/sanitize'

describe('sanitizeForDisplay', () => {
  it('bloquea handlers on*', () => {
    const input = '<p onclick="alert(1)">Hola</p>'
    expect(sanitizeForDisplay(input)).not.toContain('onclick')
  })

  it('bloquea javascript: URIs', () => {
    const input = '<a href="javascript:alert(1)">link</a>'
    expect(sanitizeForDisplay(input)).not.toContain('javascript:')
  })

  it('elimina etiquetas script', () => {
    const input = '<script>alert("xss")</script><p>Texto</p>'
    expect(sanitizeForDisplay(input)).not.toContain('<script>')
    expect(sanitizeForDisplay(input)).toContain('Texto')
  })

  it('elimina etiquetas style', () => {
    const input = '<style>body{display:none}</style><p>Visible</p>'
    expect(sanitizeForDisplay(input)).not.toContain('<style>')
    expect(sanitizeForDisplay(input)).toContain('Visible')
  })

  it('preserva HTML limpio', () => {
    const input = '<p><strong>Negrita</strong> y <em>cursiva</em></p>'
    expect(sanitizeForDisplay(input)).toBe(input)
  })
})

describe('stripHtml', () => {
  it('elimina todas las etiquetas HTML', () => {
    expect(stripHtml('<p><b>Texto</b></p>')).toBe('Texto')
  })

  it('devuelve cadena vacía si no hay texto', () => {
    expect(stripHtml('<br/><hr/>')).toBe('')
  })
})

describe('sanitizeCommentHtml', () => {
  it('devuelve una cadena', () => {
    expect(typeof sanitizeCommentHtml('<p>Hola mundo</p>')).toBe('string')
  })

  it('no devuelve scripts en la salida', () => {
    const out = sanitizeCommentHtml('<script>evil()</script><p>ok</p>')
    expect(out).not.toContain('<script>')
  })
})
