import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { isMarketplaceEnabled, getProducts } from '@/lib/supabase/queries/marketplace'
import { StoreClient } from '@/components/marketplace/StoreClient'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Tienda · ETERNIDAD',
  description: 'Merchan, libros y artículos digitales del universo ETERNIDAD.',
}

type Props = { searchParams: Promise<{ preview?: string }> }

const STAFF_ROLES = ['admin', 'dev', 'moderator'] as const

export default async function TiendaPage({ searchParams }: Props) {
  const [enabled, { preview }, session] = await Promise.all([
    isMarketplaceEnabled(),
    searchParams,
    auth(),
  ])

  const role = session?.user?.role as string | undefined
  const isStaff = role != null && (STAFF_ROLES as readonly string[]).includes(role)
  const isPreview = preview === '1' && isStaff

  if (!enabled && !isPreview) notFound()

  const products = await getProducts(true)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {isPreview && (
        <div style={{
          background: 'color-mix(in srgb, var(--amethyst) 15%, transparent)',
          border: '1px solid var(--amethyst)',
          borderRadius: 'var(--r-md)',
          padding: '10px 20px',
          margin: '16px clamp(16px, 5vw, 64px) 0',
          maxWidth: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          color: 'var(--amethyst)',
        }}>
          <span>ᛉ</span>
          <span>Vista previa — la tienda no es visible para el público todavía.</span>
          <Link href="/admin/tienda" style={{ marginLeft: 'auto', color: 'var(--amethyst)', fontSize: 12, textDecoration: 'underline' }}>
            Ir al panel →
          </Link>
        </div>
      )}

      <main style={{ padding: 'clamp(40px, 8vw, 96px) clamp(16px, 5vw, 64px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--spore)', marginBottom: 14 }}>
            ◈ · Tienda
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, margin: '0 0 16px', letterSpacing: -0.5 }}>
            Mercado Arcano
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-soft)', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
            Reliquias del universo ETERNIDAD. Artículos físicos, libros y creaciones digitales.
          </p>
        </div>

        <RuneDivider />

        {products.length === 0 ? (
          <div style={{ marginTop: 64, textAlign: 'center', padding: 64 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--spore)', marginBottom: 16, opacity: 0.3 }}>ᛟ</div>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic' }}>
              El mercado aún no tiene artículos disponibles. Vuelve pronto.
            </p>
          </div>
        ) : (
          <StoreClient products={products} />
        )}
      </main>

      <Footer />
    </div>
  )
}
