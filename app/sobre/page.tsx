import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { Btn } from '@/components/ui/Btn'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

export const metadata: Metadata = {
  title: 'Sobre la cronista',
  description: 'Escribo cosas raras en bosques imaginarios. Esto es donde apunto cómo lo hago.',
}

export default function SobrePage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <div className="page-layout" style={{ maxWidth: 880, margin: '0 auto', paddingTop: 80 }}>

        {/* Cabecera */}
        <div className="main-flex page-hero-transition" style={{ alignItems: 'center', marginBottom: 56 }}>
          <ImagePlaceholder width={220} height={280} tone="forest" label="retrato del autor" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--spore)', marginBottom: 14 }}>
              ✦ La cronista
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 500, margin: '0 0 12px', letterSpacing: -1.2, lineHeight: 1 }}>
              Hola, soy <em style={{ fontStyle: 'italic', color: 'var(--moss-300)' }}>Daria</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-soft)', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
              Escribo cosas raras en bosques imaginarios. Esto es donde apunto cómo lo hago.
            </p>
          </div>
        </div>

        <RuneDivider />

        {/* Bio */}
        <div style={{ marginTop: 48, fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.75, color: 'var(--text-soft)' }}>
          <p style={{ marginTop: 0 }}>
            Llevo seis años escribiendo en silencio.{' '}
            <em style={{ color: 'var(--text)', fontStyle: 'italic' }}>La Ceniza Verde</em>{' '}
            es mi primera novela larga — y este sitio es el cuaderno de obra abierto donde guardo
            todo lo que hace falta para terminarla.
          </p>
          <p>
            No prometo publicar a ritmo fijo. Prometo publicar todo lo que aprendo, incluso cuando
            me equivoco. Sobre todo cuando me equivoco.
          </p>
          <p>
            Si te interesa el worldbuilding lento, los bestiarios maximalistas y la idea de que
            un libro pueda fermentarse en público, este es tu árbol.
          </p>
        </div>

        {/* Contacto */}
        <div style={{ marginTop: 48, padding: 28, background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-soft)' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--rune)', marginBottom: 16 }}>
            Por dónde encontrarme
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Btn variant="ghost">Cuervo (newsletter)</Btn>
            <Link href="/feed.xml" target="_blank">
              <Btn variant="ghost">RSS</Btn>
            </Link>
            <Btn variant="ghost">Bluesky</Btn>
            <Btn variant="ghost">Goodreads</Btn>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
