import { getSession } from '@/lib/auth/session'
import { applyAsCollaborator, reviewCollaboratorApplication } from '@/lib/supabase/queries/collaborator'
import { isModeratorOrAbove } from '@/lib/auth/roles'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const applySchema = z.object({
  motivation: z.string().min(20, 'La motivación debe tener al menos 20 caracteres.').max(1000),
  portfolio:  z.string().url('URL inválida').nullable().optional(),
})

const reviewSchema = z.object({
  appId:  z.string().uuid(),
  status: z.enum(['accepted', 'rejected']),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = applySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await applyAsCollaborator(session.user.id, parsed.data.motivation, parsed.data.portfolio ?? null)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo enviar la solicitud.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user?.id || !isModeratorOrAbove(session.user.role)) {
    return NextResponse.json({ error: 'Sin permisos.' }, { status: 403 })
  }

  const parsed = reviewSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await reviewCollaboratorApplication(parsed.data.appId, parsed.data.status, session.user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo procesar la solicitud.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
