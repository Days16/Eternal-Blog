import { getSession } from '@/lib/auth/session'
import { isModeratorOrAbove } from '@/lib/auth/roles'
import { setMarketplaceEnabled } from '@/lib/supabase/queries/marketplace'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ enabled: z.boolean() })

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user || !isModeratorOrAbove(session.user.role)) {
    return NextResponse.json({ error: 'Sin permisos.' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  try {
    await setMarketplaceEnabled(parsed.data.enabled)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el flag.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
