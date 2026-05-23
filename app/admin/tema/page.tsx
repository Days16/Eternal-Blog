import Link from 'next/link'
import { getSiteTexts } from '@/lib/supabase/queries/admin'
import { bulkUpdateSiteTextsAction, restoreSiteTextAction } from '@/app/admin/actions'
import { AboutEditorWithPreview } from '@/components/admin/AboutEditorWithPreview'

type Props = { searchParams: Promise<{ tab?: string; saved?: string }> }

const DESIGN_TOKENS = [
  { name: 'Fondo principal',  token: '--moss-900', hex: '#0b1119' },
  { name: 'Fondo elevado',   token: '--moss-800', hex: '#131b27' },
  { name: 'Tarjetas',        token: '--moss-700', hex: '#1c2638' },
  { name: 'Dorado (acento)', token: '--spore',    hex: '#d4a64a' },
  { name: 'Runa',            token: '--rune',     hex: '#c89b3c' },
  { name: 'Neblina (links)', token: '--mist',     hex: '#6e8bb8' },
  { name: 'Amatista',        token: '--amethyst', hex: '#7c4a8e' },
  { name: 'Brasa (alertas)', token: '--ember',    hex: '#a83232' },
  { name: 'Texto principal', token: '--moss-100', hex: '#eef0f4' },
]

export default async function AdminTemaPage({ searchParams }: Props) {
  const { tab = 'aspecto', saved } = await searchParams
  const textsBySection = await getSiteTexts()
  const aboutTexts = textsBySection['about'] ?? []

  const TABS = [
    { id: 'aspecto', label: 'Aspecto' },
    { id: 'sobre',   label: 'Sobre el autor', badge: aboutTexts.filter(t => t.value !== t.defaultValue).length },
  ]

  return (
    <div>
      {/* Cabecera */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 6px' }}>
          Tema y aspecto
        </h1>
        <p style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 13, margin: 0 }}>
          Apariencia visual y contenido de la página Sobre el autor
        </p>
      </div>

      {/* Banner guardado */}
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
          ✓ Cambios guardados correctamente.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--border-soft)', paddingBottom: 0 }}>
        {TABS.map(t => {
          const isActive = t.id === tab
          return (
            <Link
              key={t.id}
              href={`/admin/tema?tab=${t.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderBottom: isActive ? '2px solid var(--spore)' : '2px solid transparent',
                color: isActive ? 'var(--spore)' : 'var(--text-soft)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                textDecoration: 'none',
                marginBottom: -1,
                transition: 'color 0.15s',
              }}
            >
              {t.label}
              {!!t.badge && t.badge > 0 && (
                <span style={{
                  background: 'var(--spore)',
                  color: 'var(--moss-900)',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                }}>
                  {t.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Tab: Aspecto ── */}
      {tab === 'aspecto' && (
        <div>
          {/* Paleta de colores */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 14 }}>
              Paleta de colores del sistema
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {DESIGN_TOKENS.map(tok => (
                <div key={tok.token} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-sm)',
                    background: tok.hex,
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                      {tok.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>
                      {tok.hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipografía */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 14 }}>
              Tipografía
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {[
                { role: 'Display',   font: 'Cormorant Garamond', sample: 'La Ceniza Verde',   var: '--font-display' },
                { role: 'Cuerpo',    font: 'Fraunces',           sample: 'Una historia lenta', var: '--font-body' },
                { role: 'Interfaz',  font: 'Inter',              sample: 'Botones y labels',   var: '--font-ui' },
                { role: 'Mono',      font: 'JetBrains Mono',     sample: 'código · 123',       var: '--font-mono' },
              ].map(f => (
                <div key={f.var} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: '16px 18px',
                }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-mute)', marginBottom: 8 }}>
                    {f.role}
                  </div>
                  <div style={{ fontFamily: `var(${f.var})`, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>
                    {f.sample}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                    {f.font}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: '20px 24px',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-mute)',
            lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-soft)' }}>
              El sistema de diseño de ETERNIDAD está definido en <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--spore)' }}>tokens.css</code> como variables CSS.
            </p>
            <p style={{ margin: 0 }}>
              Para cambiar textos de la interfaz (botones, labels, mensajes), usa{' '}
              <Link href="/admin/textos" style={{ color: 'var(--spore)', textDecoration: 'none' }}>Textos del sitio</Link>.
              El contenido de la página Sobre se edita en la pestaña <strong style={{ color: 'var(--text)' }}>Sobre el autor</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Sobre el autor ── */}
      {tab === 'sobre' && (
        <div>
          {aboutTexts.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)',
              padding: '36px 24px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              color: 'var(--text-mute)',
            }}>
              Ejecuta la migración <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>006_about_texts.sql</code> en Supabase para habilitar estos textos.
            </div>
          ) : (
            <AboutEditorWithPreview
              initialTexts={aboutTexts}
              action={bulkUpdateSiteTextsAction}
              restoreAction={restoreSiteTextAction}
            />
          )}
        </div>
      )}
    </div>
  )
}
