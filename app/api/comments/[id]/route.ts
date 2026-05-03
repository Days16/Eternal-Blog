import { auth } from '@/auth'
import { deleteComment, toggleSealComment } from '@/lib/supabase/queries/comments'
import { NextResponse } from 'next/server'

type Context = { params: Promise<{ id: string }> }

function canModerate(role: string | undefined) {
  return role === 'admin' || role === 'moderator' || role === 'dev'
}

export async function DELETE(request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hard = searchParams.get('hard') === 'true'

  try {
    const { id } = await params
    const comment = await deleteComment(id, session.user.id, canModerate(session.user.role), hard)
    if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    return NextResponse.json({ comment })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el comentario'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!canModerate(session.user.role)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const { id } = await params
    const { sealed } = await request.json()
    const comment = await toggleSealComment(id, !!sealed)
    if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar comentario' }, { status: 400 })
  }
}
