import { getSession } from '@/lib/auth/session'
import { getUserFeaturedEntries, upsertFeaturedEntry, removeFeaturedEntry } from '@/lib/supabase/queries/users'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }
  const entries = await getUserFeaturedEntries(session.user.id)
  return NextResponse.json({ entries })
}

const addSchema = z.object({
  entryId:  z.string().uuid('entryId inválido'),
  position: z.number().int().min(1).max(3),
})

const removeSchema = z.object({
  position: z.number().int().min(1).max(3),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = addSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await upsertFeaturedEntry(session.user.id, parsed.data.entryId, parsed.data.position)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo destacar el artículo.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = removeSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await removeFeaturedEntry(session.user.id, parsed.data.position)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo quitar el artículo.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
