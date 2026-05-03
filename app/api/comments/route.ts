import { auth } from '@/auth'
import { createComment } from '@/lib/supabase/queries/comments'
import { awardXP } from '@/lib/xp/award'
import { XP } from '@/lib/xp/events'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local'
  const limit = rateLimit(`comments:${ip}`, 30, 60_000)
  if (limit.limited) return NextResponse.json({ error: 'Demasiados comentarios. Espera un momento.' }, { status: 429 })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Debes iniciar sesión para comentar' }, { status: 401 })

  try {
    const payload = await request.json()
    const entryId = typeof payload.entryId === 'string' ? payload.entryId : ''
    const body = typeof payload.body === 'string' ? payload.body : ''
    const parentId = typeof payload.parentId === 'string' && payload.parentId.length > 0 ? payload.parentId : null

    if (!entryId) return NextResponse.json({ error: 'Entrada no válida' }, { status: 400 })
    if (!body.trim()) return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 })

    const comment = await createComment({ entryId, userId: session.user.id, body, parentId })
    const xp = await awardXP(session.user.id, parentId ? XP.REPLY : XP.COMMENT, 'comment', comment.id)

    return NextResponse.json({ comment, xp }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el comentario'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
