'use client'

import { useState } from 'react'
import { Btn } from '@/components/ui/Btn'

export function AddToCartButton({ productId }: { productId: string }) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')

  async function add() {
    if (status === 'adding') return
    setStatus('adding')
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', productId }),
    })
    setStatus(res.ok ? 'added' : 'error')
    if (res.ok) setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <Btn
      type="button"
      variant="rune"
      onClick={add}
      disabled={status === 'adding'}
    >
      {status === 'adding' ? 'Añadiendo…' : status === 'added' ? '✓ En el carrito' : status === 'error' ? 'Error, reintenta' : 'Añadir al carrito'}
    </Btn>
  )
}
