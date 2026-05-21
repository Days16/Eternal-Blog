import Link from 'next/link'
import type { Product } from '@/lib/supabase/queries/marketplace'

interface ProductCardProps {
  product: Product
}

const TYPE_ICONS = { merch: '◈', book: '📖', digital: '✦' }
const TYPE_LABELS = { merch: 'Merchan', book: 'Libro', digital: 'Digital' }

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/tienda/${product.slug}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          transition: 'border-color var(--t-fast)',
          height: '100%',
          display: 'flex', flexDirection: 'column',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--spore)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)')}
      >
        {/* Imagen / placeholder */}
        <div style={{
          aspectRatio: '1', background: 'var(--moss-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 64,
          color: 'var(--spore)', opacity: 0.4,
        }}>
          {TYPE_ICONS[product.type]}
        </div>

        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--rune)', marginBottom: 8 }}>
            {TYPE_LABELS[product.type]}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', marginBottom: 8, flex: 1 }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--spore)' }}>
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            {product.stock <= 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ember)', textTransform: 'uppercase' }}>
                Agotado
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
