'use client'

import { useState } from 'react'

interface SiteTextItem {
  key: string
  value: string
  defaultValue: string
  description?: string | null
}

interface Props {
  initialTexts: SiteTextItem[]
  action: (formData: FormData) => void | Promise<void>
  restoreAction: (formData: FormData) => void | Promise<void>
}

const LABEL: Record<string, string> = {
  'about.name':          'Nombre',
  'about.tagline':       'Tagline',
  'about.bio_1':         'Párrafo bio 1',
  'about.bio_2':         'Párrafo bio 2',
  'about.bio_3':         'Párrafo bio 3',
  'about.contact_title': 'Título sección contacto',
  'about.avatar_url':    'URL del avatar',
}

export function AboutEditorWithPreview({ initialTexts, action, restoreAction }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initialTexts.map(t => [t.key, t.value]))
  )

  const v = (k: string, fallback = '') => values[k] ?? fallback

  function handleChange(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

      {/* ── Formulario ── */}
      <form action={action}>
        <input type="hidden" name="section" value="about" />
        <input type="hidden" name="keys" value={JSON.stringify(initialTexts.map(t => t.key))} />
        <input type="hidden" name="redirectTo" value="/admin/tema?tab=sobre&saved=1" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {initialTexts.map(item => {
            const isModified = values[item.key] !== item.defaultValue
            const label = item.description ?? LABEL[item.key] ?? item.key
            const isUrl = item.key === 'about.avatar_url'
            const isLong = !isUrl && (values[item.key]?.length ?? 0) > 80

            return (
              <div key={item.key} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isModified ? 'color-mix(in srgb, var(--spore) 40%, var(--border-soft))' : 'var(--border-soft)'}`,
                borderRadius: 'var(--r-lg)',
                padding: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>{item.key}</div>
                  </div>
                  {isModified && (
                    <form action={restoreAction} style={{ flexShrink: 0 }}>
                      <input type="hidden" name="key" value={item.key} />
                      <input type="hidden" name="section" value="about" />
                      <input type="hidden" name="redirectTo" value="/admin/tema?tab=sobre" />
                      <button type="submit" style={{
                        background: 'none',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 'var(--r-sm)',
                        color: 'var(--text-mute)',
                        fontSize: 11,
                        fontFamily: 'var(--font-ui)',
                        padding: '3px 10px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}>
                        Restaurar
                      </button>
                    </form>
                  )}
                </div>

                <textarea
                  name={item.key}
                  value={values[item.key] ?? ''}
                  onChange={e => handleChange(item.key, e.target.value)}
                  rows={isUrl ? 1 : isLong ? 3 : 2}
                  placeholder={isUrl ? 'https://…' : undefined}
                  style={{
                    width: '100%',
                    background: 'var(--moss-900)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    padding: '8px 10px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />

                {isModified && (
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.4 }}>
                    <span style={{ marginRight: 4 }}>Original:</span>
                    <em>{item.defaultValue || '(vacío)'}</em>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" style={{
            background: 'var(--spore)',
            color: 'var(--moss-900)',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 700,
            padding: '10px 28px',
            cursor: 'pointer',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Guardar →
          </button>
        </div>
      </form>

      {/* ── Preview ── */}
      <div style={{ position: 'sticky', top: 80 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 2,
          color: 'var(--text-mute)',
          marginBottom: 12,
        }}>
          Vista previa
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
          overflow: 'hidden',
        }}>
          {/* Avatar placeholder + name */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            {v('about.avatar_url') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={v('about.avatar_url')}
                alt="avatar"
                style={{ width: 60, height: 76, objectFit: 'cover', borderRadius: 'var(--r-md)', flexShrink: 0, border: '1px solid var(--border-soft)' }}
              />
            ) : (
              <div style={{ width: 60, height: 76, background: 'var(--moss-700)', borderRadius: 'var(--r-md)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, opacity: 0.5 }}>
                🌿
              </div>
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 6 }}>
                ✦ La cronista
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: 'var(--text)', marginBottom: 8 }}>
                Hola, soy <em style={{ color: 'var(--moss-300)' }}>{v('about.name', 'Daria')}</em>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {v('about.tagline', 'Escribo cosas raras en bosques imaginarios.')}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-soft)', margin: '12px 0' }} />

          {/* Bio */}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.7 }}>
            {v('about.bio_1') && <p style={{ margin: '0 0 8px' }}>{v('about.bio_1')}</p>}
            {v('about.bio_2') && <p style={{ margin: '0 0 8px' }}>{v('about.bio_2')}</p>}
            {v('about.bio_3') && <p style={{ margin: 0 }}>{v('about.bio_3')}</p>}
          </div>

          {/* Contacto */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-soft)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--rune)', marginBottom: 10 }}>
              {v('about.contact_title', 'Por dónde encontrarme')}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Cuervo', 'Bluesky', 'Goodreads'].map(label => (
                <span key={label} style={{
                  padding: '4px 10px',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10,
                  color: 'var(--text-mute)',
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <a
          href="/sobre"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            marginTop: 10,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: 'var(--mist)',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Ver página completa ↗
        </a>
      </div>
    </div>
  )
}
