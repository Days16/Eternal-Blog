import { auth } from '@/auth'
import { addToCart, updateCartQuantity, removeFromCart, createOrder } from '@/lib/supabase/queries/marketplace'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'),    productId: z.string().uuid(), quantity: z.number().int().min(1).optional() }),
  z.object({ action: z.literal('update'), productId: z.string().uuid(), quantity: z.number().int().min(1) }),
  z.object({ action: z.literal('remove'), productId: z.string().uuid() }),
  z.object({ action: z.literal('checkout') }),
])

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = session.user.id
  const data   = parsed.data

  try {
    switch (data.action) {
      case 'add':
        await addToCart(userId, data.productId, data.quantity ?? 1)
        return NextResponse.json({ ok: true })

      case 'update':
        await updateCartQuantity(userId, data.productId, data.quantity)
        return NextResponse.json({ ok: true })

      case 'remove':
        await removeFromCart(userId, data.productId)
        return NextResponse.json({ ok: true })

      case 'checkout': {
        const orderId = await createOrder(userId)
        return NextResponse.json({ orderId }, { status: 201 })
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar la solicitud.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
