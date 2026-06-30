import { getSession } from '@/lib/auth/session'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { awardXP } from '@/lib/xp/award'
import { XP } from '@/lib/xp/events'
import { apiError } from '@/lib/utils/api-error'
import { rateLimit } from '@/lib/rate-limit'
import { ReactionSchema } from '@/lib/schemas'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get('entryId')
  if (!entryId) return NextResponse.json({ error: 'Falta entryId' }, { status: 400 })

  const session = await getSession()
  const supabase = getSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })

  // Obtener conteos por tipo
  const { data: reactions, error } = await supabase
    .from('reactions')
    .select('kind, user_id, entry_id')
    .eq('entry_id', entryId)

  if (error) {
    console.error('[reactions] GET Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const counts: Record<string, number> = {}
  reactions.forEach(r => {
    const key = r.kind
    if (key) counts[key] = (counts[key] ?? 0) + 1
  })

  // Obtener reacciones del usuario actual
  let userReactions: string[] = []
  if (session?.user?.id) {
    const { data: userOnes } = await supabase
      .from('reactions')
      .select('kind')
      .eq('entry_id', entryId)
      .eq('user_id', session.user.id)
    
    userReactions = (userOnes ?? []).map(r => r.kind)
  }

  return NextResponse.json({ ...counts, userReactions })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { limited } = rateLimit(`react:${session.user.id}`, 30, 60_000)  // 30 reacciones / minuto
  if (limited) return NextResponse.json({ error: 'Demasiadas reacciones. Espera un momento.' }, { status: 429 })

  try {
    const parsed = ReactionSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    const { entryId, kind } = parsed.data

    const supabase = getSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Servidor no configurado' }, { status: 500 })

    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from('reactions')
      .select('kind')
      .eq('entry_id', entryId)
      .eq('user_id', session.user.id)
      .eq('kind', kind)
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      // Toggle OFF: Eliminar reacción
      const { error: delError } = await supabase
        .from('reactions')
        .delete()
        .eq('entry_id', entryId)
        .eq('user_id', session.user.id)
        .eq('kind', kind)

      if (delError) throw delError
      return NextResponse.json({ toggled: 'off' })
    } else {
      // Toggle ON: Insertar reacción
      const { error: insError } = await supabase.from('reactions').insert({
        entry_id: entryId,
        user_id: session.user.id,
        kind
      })

      if (insError) {
        console.error('[reactions] Error inserting reaction:', insError)
        throw insError
      }

      // Dar XP
      try {
        await awardXP(session.user.id, XP.REACTION_GIVEN, 'reaction', entryId)
      } catch (xpErr) {
        console.error('[reactions] Error awarding XP:', xpErr)
      }
      
      return NextResponse.json({ toggled: 'on' })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return apiError(message, error, 500)
  }
}
