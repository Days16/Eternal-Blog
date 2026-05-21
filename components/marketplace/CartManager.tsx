'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/supabase/queries/marketplace'
import { Btn } from '@/components/ui/Btn'

interface CartManagerProps {
  items: CartItem[]
  total: number
}

export function CartManager({ items: initialItems }: CartManagerProps) {
  const [items, setItems] = useState(initialItems)
  const [busy, setBusy] = useState<string | null>(null)
  const [ordering, setOrdering] = useState(false)
  const router = useRouter()

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  async function updateQuantity(productId: string, quantity: number) {
    setBusy(productId)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', productId, quantity }),
    })
    if (res.ok) setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i))
    setBusy(null)
  }

  async function removeItem(productId: string) {
    setBusy(productId)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', productId }),
    })
    if (res.ok) setItems(prev => prev.filter(i => i.productId !== productId))
    setBusy(null)
  }

  async function checkout() {
    if (ordering) return
    setOrdering(true)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkout' }),
    })
    if (res.ok) {
      const { orderId } = await res.json()
      router.push(`/tienda?pedido=${orderId}`)
    } else {
      setOrdering(false)
    }
  }

  return (
    <div>
      {/* Lista de artículos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {items.map(item => (
          <div key={item.productId} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border-soft)', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, background: 'var(--moss-700)', borderRadius: 'var(--r-md)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--spore)', opacity: 0.5 }}>
              {item.product.type === 'book' ? '📖' : '◈'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {item.product.name}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--spore)' }}>
                {item.product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" disabled={item.quantity <= 1 || busy === item.productId} onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--moss-700)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                −
              </button>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
              <button type="button" disabled={busy === item.productId} onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--moss-700)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                +
              </button>
              <button type="button" onClick={() => removeItem(item.productId)} disabled={busy === item.productId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', fontFamily: 'var(--font-ui)', fontSize: 12, marginLeft: 8 }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
          <span>Total</span>
          <span style={{ color: 'var(--spore)' }}>
            {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <Btn type="button" variant="rune" disabled={ordering || items.length === 0} onClick={checkout} style={{ width: '100%' }}>
          {ordering ? 'Procesando…' : 'Confirmar pedido'}
        </Btn>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
          Pago y envío gestionados manualmente. Recibirás confirmación por correo.
        </p>
      </div>
    </div>
  )
}
