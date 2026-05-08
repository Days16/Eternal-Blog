import Link from 'next/link'
import { getSiteTexts } from '@/lib/supabase/queries/admin'
import { bulkUpdateSiteTextsAction, restoreSiteTextAction } from '@/app/admin/actions'

type Props = { searchParams: Promise<{ section?: string; saved?: string }> }

const SECTION_ORDER = [
  'autenticación',
  'navegación',
  'inicio',
  'codex',
  'comentarios',
  'búsqueda',
  'reacciones',
]

export default async function AdminTextosPage({ searchParams }: Props) {
  const { section = 'autenticación', saved } = await searchParams
  const textsBySection = await getSiteTexts()

  const sections = SECTION_ORDER.filter(s => textsBySection[s])
  const currentTexts = textsBySection[section] ?? []
  const modifiedCount = currentTexts.filter(t => t.value !== t.defaultValue).length

  return (
    <div>
      {/* Cabecera */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          margin: '0 0 6px',
        }}>
          Textos del sitio
        </h1>
        <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
          Adapta el copy y el lore de la interfaz sin tocar el código.
        </p>
      </div>

      {/* Banner de guardado */}
      {saved && (
        <div style={{
          background: 'color-mix(in srgb, var(--spore) 15%, transparent)',
          border: '1px solid var(--spore)',
          borderRadius: 'var(--r-md)',
          padding: '10px 16px',
          marginBottom: 20,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--spore)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          ✓ Textos guardados correctamente.
        </div>
      )}

      {/* Tabs de sección */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {sections.map(sec => {
          const isActive = sec === section
          const secTexts = textsBySection[sec] ?? []
          const secModified = secTexts.filter(t => t.value !== t.defaultValue).length
          return (
            <Link
              key={sec}
              href={`/admin/textos?section=${encodeURIComponent(sec)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                border: '1px solid',
                borderColor: isActive ? 'var(--spore)' : 'var(--border-soft)',
                borderRadius: 'var(--r-sm)',
                background: isActive ? 'var(--spore)' : 'transparent',
                color: isActive ? 'var(--moss-900)' : 'var(--text-soft)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                textDecoration: 'none',
                textTransform: 'capitalize',
                fontWeight: isActive ? 700 : 400,
                transition: 'border-color 0.15s, color 0.15s',
              }}
            >
              {sec}
              {secModified > 0 && (
                <span style={{
                  background: isActive ? 'var(--moss-900)' : 'var(--spore)',
                  color: isActive ? 'var(--spore)' : 'var(--moss-900)',
                  borderRadius: '999px',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  lineHeight: 1.4,
                }}>
                  {secModified}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Resumen de la sección */}
      {currentTexts.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--text-mute)',
        }}>
          <span style={{ textTransform: 'capitalize' }}>
            {section} — {currentTexts.length} texto{currentTexts.length > 1 ? 's' : ''}
            {modifiedCount > 0 && (
              <span style={{ color: 'var(--spore)', marginLeft: 8 }}>
                ({modifiedCount} personalizado{modifiedCount > 1 ? 's' : ''})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Formulario de la sección */}
      <form action={bulkUpdateSiteTextsAction}>
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="keys" value={JSON.stringify(currentTexts.map(t => t.key))} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentTexts.map(item => {
            const isModified = item.value !== item.defaultValue
            return (
              <div key={item.key} style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isModified ? 'color-mix(in srgb, var(--spore) 40%, var(--border-soft))' : 'var(--border-soft)'}`,
                borderRadius: 'var(--r-lg)',
                padding: 16,
              }}>
                {/* Metadata del texto */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                      {item.description ?? item.key}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>
                      {item.key}
                    </div>
                  </div>

                  {isModified && (
                    <form action={restoreSiteTextAction} style={{ flexShrink: 0 }}>
                      <input type="hidden" name="key" value={item.key} />
                      <input type="hidden" name="section" value={section} />
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
                        Restaurar original
                      </button>
                    </form>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  name={item.key}
                  defaultValue={item.value}
                  rows={item.value.length > 100 ? 3 : 2}
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
                    transition: 'border-color 0.15s',
                  }}
                />

                {/* Valor por defecto */}
                {isModified && (
                  <div style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: 'var(--text-mute)',
                    lineHeight: 1.4,
                  }}>
                    <span style={{ marginRight: 4 }}>Original:</span>
                    <em>{item.defaultValue}</em>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {currentTexts.length === 0 && (
          <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic', padding: '24px 0' }}>
            No hay textos configurables en esta sección.
          </p>
        )}

        {currentTexts.length > 0 && (
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
              Guardar sección →
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
