import { getSession } from '@/lib/auth/session'
import { createComment } from '@/lib/supabase/queries/comments'
import { awardXP } from '@/lib/xp/award'
import { XP } from '@/lib/xp/events'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const commentSchema = z.object({
  entryId: z.string().uuid('entryId inválido'),
  body: z.string().min(1, 'El comentario no puede estar vacío').max(2000),
  parentId: z.string().uuid().nullable().optional(),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local'
  const limit = rateLimit(`comments:${ip}`, 30, 60_000)
  if (limit.limited) return NextResponse.json({ error: 'Demasiados comentarios. Espera un momento.' }, { status: 429 })

  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Debes iniciar sesión para comentar' }, { status: 401 })

  try {
    const parsed = commentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Payload inválido',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const body = parsed.data.body.trim()
    if (!body) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 })
    }

    const comment = await createComment({
      entryId: parsed.data.entryId,
      userId: session.user.id,
      body,
      parentId: parsed.data.parentId ?? null,
    })
    const xp = await awardXP(session.user.id, parsed.data.parentId ? XP.REPLY : XP.COMMENT, 'comment', comment.id)

    return NextResponse.json({ comment, xp }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el comentario'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
