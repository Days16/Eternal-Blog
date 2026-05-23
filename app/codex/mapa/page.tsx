import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'

export const metadata: Metadata = {
  title: 'Mapa del Mundo · Codex',
  description: 'Cartografía interactiva del universo de La Ceniza Verde.',
}

export default function MapaPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* Hero */}
      <section className="page-hero page-hero-transition" style={{ textAlign: 'center', paddingBottom: 0 }}>
        <div className="reveal" style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--rune)', marginBottom: 16 }}>
          ✦ CODEX · CARTOGRAFÍA ✦
        </div>
        <h1 className="hero-title reveal reveal-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: -1.5, margin: '0 0 16px', lineHeight: 1 }}>
          Mapa del <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>mundo</em>
        </h1>
        <p className="reveal reveal-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2.5vw, 17px)', fontStyle: 'italic', color: 'var(--text-soft)', maxWidth: 560, margin: '0 auto', lineHeight: 1.5 }}>
          Cartografía interactiva del universo de <em>La Ceniza Verde</em>. Lugares, rutas y territorios del bosque arcano.
        </p>
      </section>

      <div className="page-layout" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <RuneDivider char="✦ MAPA EN CONSTRUCCIÓN ✦" />

        {/* Placeholder del mapa */}
        <div
          id="mapa-interactivo"
          style={{
            marginTop: 40,
            width: '100%',
            minHeight: 520,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Cuadrícula decorativa de fondo */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--spore)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Runa central decorativa */}
          <div style={{
            position: 'absolute',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(80px, 15vw, 180px)',
            color: 'var(--spore)',
            opacity: 0.04,
            lineHeight: 1,
            userSelect: 'none',
          }}>
            ᛗ
          </div>

          {/* Contenido centrado */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--spore)', opacity: 0.5, marginBottom: 20 }}>
              ᛗ
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 500, margin: '0 0 12px', letterSpacing: -0.5 }}>
              El mapa aún se está trazando
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.65 }}>
              La cartografía interactiva del mundo de <em>La Ceniza Verde</em> está en desarrollo. Aquí podrás explorar territorios, localizar personajes y descubrir ruinas ocultas.
            </p>

            {/* Localizaciones previstas */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
              {[
                { rune: 'ᚠ', name: 'El Bosque Ceniza' },
                { rune: 'ᚢ', name: 'La Ciudad Lacrada' },
                { rune: 'ᚦ', name: 'Ruinas del Norte' },
                { rune: 'ᚨ', name: 'El Valle Profundo' },
                { rune: 'ᚱ', name: 'La Frontera Ardiente' },
                { rune: 'ᚲ', name: 'Refugio del Archimago' },
              ].map(loc => (
                <div
                  key={loc.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 99,
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: 'var(--text-soft)',
                    fontStyle: 'italic',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--spore)', fontSize: 14 }}>{loc.rune}</span>
                  {loc.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nota editorial */}
        <div style={{
          marginTop: 32,
          padding: '20px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--rune)', flexShrink: 0 }}>ᛈ</div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--rune)', marginBottom: 8 }}>Nota de la cronista</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-mute)', fontStyle: 'italic', margin: 0, lineHeight: 1.7 }}>
              El mapa interactivo se añadirá cuando la geografía del mundo esté suficientemente consolidada. Mientras tanto, puedes encontrar referencias a los lugares en las entradas del Codex.
            </p>
          </div>
        </div>

        {/* Vuelta al Codex */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            href="/codex"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--text-mute)',
              textDecoration: 'none',
              letterSpacing: 1,
            }}
          >
            ← Volver al Codex
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
