'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/supabase/queries/marketplace'

interface ProductCardProps {
  product: Product
}

const TYPE_ICONS = { merch: '◈', book: '📖', digital: '✦' }
const TYPE_LABELS = { merch: 'Merchan', book: 'Libro', digital: 'Digital' }

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')

  const images = product.imageUrl ? product.imageUrl.split(',').map(s => s.trim()).filter(Boolean) : []

  function prevImage(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  function nextImage(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock <= 0 || cartStatus === 'adding') return
    setCartStatus('adding')
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', productId: product.id }),
    })
    if (res.ok) {
      setCartStatus('added')
      setTimeout(() => setCartStatus('idle'), 2000)
    } else {
      setCartStatus('error')
      setTimeout(() => setCartStatus('idle'), 2000)
    }
  }

  async function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock <= 0) return
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', productId: product.id }),
    })
    if (res.ok) {
      router.push('/tienda/carrito')
    }
  }

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
          position: 'relative', overflow: 'hidden'
        }}>
          {images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeIdx]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    style={{
                      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(11, 17, 25, 0.75)', border: '1px solid rgba(212, 166, 74, 0.2)',
                      color: 'var(--spore)', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      zIndex: 2,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(11, 17, 25, 0.75)', border: '1px solid rgba(212, 166, 74, 0.2)',
                      color: 'var(--spore)', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      zIndex: 2,
                    }}
                  >
                    ›
                  </button>
                  <div style={{
                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: 4, zIndex: 2
                  }}>
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: idx === activeIdx ? 'var(--spore)' : 'rgba(255, 255, 255, 0.4)',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--spore)', opacity: 0.4 }}>
              {TYPE_ICONS[product.type]}
            </span>
          )}
        </div>

        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--rune)', marginBottom: 6 }}>
            {TYPE_LABELS[product.type]}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', marginBottom: 6 }}>
            {product.name}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.4, marginBottom: 12, flex: 1 }}>
            {product.description ? (product.description.length > 70 ? `${product.description.substring(0, 70)}...` : product.description) : 'Sin descripción.'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--spore)' }}>
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            {product.stock <= 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ember)', textTransform: 'uppercase' }}>
                Agotado
              </span>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || cartStatus === 'adding'}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-soft)',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                cursor: (product.stock <= 0 || cartStatus === 'adding') ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {cartStatus === 'adding' ? '...' : cartStatus === 'added' ? '✓ Añadido' : cartStatus === 'error' ? 'Error' : 'Añadir'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: 'var(--spore)',
                color: 'var(--accent-ink)',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                transition: 'opacity 0.2s',
              }}
            >
              Comprar
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
