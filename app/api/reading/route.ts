import { getSession } from '@/lib/auth/session'
import { markAsRead, unmarkAsRead } from '@/lib/supabase/queries/reading'
import { awardXP } from '@/lib/xp/award'
import { XP } from '@/lib/xp/events'
import { apiError } from '@/lib/utils/api-error'
import { rateLimit } from '@/lib/rate-limit'
import { ReadHistorySchema } from '@/lib/schemas'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { limited } = rateLimit(`read:${session.user.id}`, 60, 60_000)
  if (limited) return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un momento.' }, { status: 429 })

  try {
    const parsed = ReadHistorySchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    const { entryId } = parsed.data

    const { alreadyRead } = await markAsRead(session.user.id, entryId)

    if (!alreadyRead) {
      try {
        await awardXP(session.user.id, XP.ENTRY_READ, 'entry_read', entryId)
      } catch (xpErr) {
        console.error('[reading] Error awarding XP:', xpErr)
      }
    }

    return NextResponse.json({ ok: true, alreadyRead })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return apiError(message, error, 500)
  }
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const parsed = ReadHistorySchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    const { entryId } = parsed.data

    await unmarkAsRead(session.user.id, entryId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return apiError(message, error, 500)
  }
}
