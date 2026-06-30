import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { isMarketplaceEnabled, getCartItems } from '@/lib/supabase/queries/marketplace'
import { CartManager } from '@/components/marketplace/CartManager'

export const metadata: Metadata = { title: 'Carrito · ETERNIDAD' }

export default async function CarritoPage() {
  const enabled = await isMarketplaceEnabled()
  if (!enabled) notFound()

  const session = await getSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/tienda/carrito')

  const items = await getCartItems(session.user.id)
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <main style={{ padding: 'clamp(40px, 8vw, 96px) clamp(16px, 5vw, 64px)', maxWidth: 760, margin: '0 auto' }}>
        <Link href="/tienda" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2 }}>
          ← Tienda
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 600, margin: '24px 0 40px', letterSpacing: -0.8 }}>
          Carrito
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic' }}>
              Tu carrito está vacío.{' '}
              <Link href="/tienda" style={{ color: 'var(--mist)' }}>Explorar la tienda</Link>
            </p>
          </div>
        ) : (
          <CartManager items={items} total={total} />
        )}
      </main>

      <Footer />
    </div>
  )
}
