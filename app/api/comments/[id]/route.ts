import { auth } from '@/auth'
import { deleteComment, sealComment } from '@/lib/supabase/queries/comments'
import { NextResponse } from 'next/server'

type Context = { params: Promise<{ id: string }> }

function canModerate(role: string | undefined) {
  return role === 'admin' || role === 'moderator'
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { id } = await params
    const comment = await deleteComment(id, session.user.id, canModerate(session.user.role))
    if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    return NextResponse.json({ comment })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el comentario'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function PATCH(_request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!canModerate(session.user.role)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const comment = await sealComment(id)
  if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
  return NextResponse.json({ comment })
}
