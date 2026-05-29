'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/marketplace/ProductCard'
import type { Product } from '@/lib/supabase/queries/marketplace'

const CATEGORIES = [
  { value: 'all',     label: 'Todo' },
  { value: 'merch',   label: 'Merch' },
  { value: 'book',    label: 'Libro' },
  { value: 'digital', label: 'Digital' },
]

const PRICE_RANGES = [
  { value: 'all',      label: 'Cualquier precio' },
  { value: 'under10',  label: 'Menos de 10 €' },
  { value: '10to25',   label: '10 € – 25 €' },
  { value: 'over25',   label: 'Más de 25 €' },
]

function filterBtn(active: boolean): React.CSSProperties {
  return {
    textAlign: 'left',
    padding: '7px 10px',
    borderRadius: 'var(--r-sm)',
    border: 'none',
    background: active ? 'color-mix(in srgb, var(--spore) 12%, transparent)' : 'transparent',
    color: active ? 'var(--spore)' : 'var(--text-soft)',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    borderLeft: `2px solid ${active ? 'var(--spore)' : 'transparent'}`,
    width: '100%',
    transition: 'all 0.15s',
  }
}

function matchesPrice(price: number, range: string) {
  if (range === 'under10')  return price < 10
  if (range === '10to25')   return price >= 10 && price <= 25
  if (range === 'over25')   return price > 25
  return true
}

export function StoreClient({ products }: { products: Product[] }) {
  const [category,   setCategory]   = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  const filtered = products.filter(p => {
    if (category !== 'all' && p.type !== category) return false
    return matchesPrice(p.price, priceRange)
  })

  const hasFilter = category !== 'all' || priceRange !== 'all'

  return (
    <>
      {/* Layout 2 columnas en desktop */}
      <div className="store-layout">
        {/* ── Sidebar de filtros ───────────────────────── */}
        <aside className="store-filters" style={{
          position: 'sticky',
          top: 80,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Categoría */}
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: 2, color: 'var(--spore)', marginBottom: 10,
            }}>
              Categoría
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  style={filterBtn(category === cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: 2, color: 'var(--spore)', marginBottom: 10,
            }}>
              Precio
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {PRICE_RANGES.map(range => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setPriceRange(range.value)}
                  style={filterBtn(priceRange === range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {hasFilter && (
            <button
              type="button"
              onClick={() => { setCategory('all'); setPriceRange('all') }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-mute)',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* ── Grid de productos ────────────────────────── */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 48,
                color: 'var(--spore)', marginBottom: 16, opacity: 0.3,
              }}>
                ᛟ
              </div>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic' }}>
                Ningún artículo coincide con esos filtros.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-mute)', marginBottom: 16,
              }}>
                {filtered.length} {filtered.length === 1 ? 'artículo' : 'artículos'}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 24,
              }}>
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </>
  )
}
