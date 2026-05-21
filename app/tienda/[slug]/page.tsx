import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { isMarketplaceEnabled, getProductBySlug } from '@/lib/supabase/queries/marketplace'
import { AddToCartButton } from '@/components/marketplace/AddToCartButton'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return product ? { title: `${product.name} · Tienda`, description: product.description ?? undefined } : {}
}

export default async function ProductPage({ params }: Props) {
  const enabled = await isMarketplaceEnabled()
  if (!enabled) notFound()

  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const TYPE_LABELS = { merch: 'Merchan', book: 'Libro', digital: 'Digital' }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <main style={{ padding: 'clamp(40px, 8vw, 96px) clamp(16px, 5vw, 64px)', maxWidth: 900, margin: '0 auto' }}>
        <Link href="/tienda" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2 }}>
          ← Tienda
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 40, alignItems: 'start' }}>
          {/* Imagen */}
          <div style={{ aspectRatio: '1', background: 'var(--moss-700)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--spore)', opacity: 0.4 }}>
            {product.type === 'book' ? '📖' : product.type === 'digital' ? '✦' : '◈'}
          </div>

          {/* Detalles */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--rune)', marginBottom: 10 }}>
              {TYPE_LABELS[product.type]}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            {product.description && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)', lineHeight: 1.75, marginBottom: 24 }}>
                {product.description}
              </p>
            )}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--spore)', marginBottom: 24 }}>
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: product.stock > 0 ? 'var(--mist)' : 'var(--ember)', marginBottom: 24 }}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </div>

            {product.stock > 0 && <AddToCartButton productId={product.id} />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
