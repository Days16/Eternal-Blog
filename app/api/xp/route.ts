import { getSession } from '@/lib/auth/session'
import { requireSupabase } from '@/lib/supabase/helpers'
import { EASTER_EGGS } from '@/lib/achievements/easter-eggs'
import { evaluateAchievements } from '@/lib/achievements/evaluator'
import { awardXP } from '@/lib/xp/award'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { limited } = rateLimit(`xp:${session.user.id}`, 10, 60_000)  // 10 eventos / minuto
  if (limited) return NextResponse.json({ error: 'Demasiadas solicitudes. Espera un momento.' }, { status: 429 })

  const payload = await request.json().catch(() => ({}))
  const kind = String(payload.kind ?? '')
  const slug = String(payload.slug ?? '')

  if (kind !== 'easter_egg') return NextResponse.json({ error: 'Evento no soportado' }, { status: 400 })

  const definition = EASTER_EGGS.find(egg => egg.slug === slug)
  if (!definition) return NextResponse.json({ error: 'Huevo desconocido' }, { status: 404 })
  const supabase = requireSupabase()

  let { data: egg } = await supabase
    .from('easter_eggs')
    .select('id,slug,description,xp_reward,found_count')
    .eq('slug', slug)
    .maybeSingle()

  if (!egg) {
    const { data: created } = await supabase
      .from('easter_eggs')
      .insert({ slug, description: definition.description, xp_reward: definition.xpReward })
      .select('id,slug,description,xp_reward,found_count')
      .single()
    egg = created
  }
  if (!egg) return NextResponse.json({ error: 'No se pudo registrar el huevo' }, { status: 500 })

  const { data: existing } = await supabase
    .from('user_easter_eggs')
    .select('user_id')
    .eq('user_id', session.user.id)
    .eq('egg_id', egg.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ alreadyFound: true })

  await supabase.from('user_easter_eggs').insert({ user_id: session.user.id, egg_id: egg.id })
  await supabase.from('easter_eggs').update({ found_count: (egg.found_count ?? 0) + 1 }).eq('id', egg.id)
  const xp = await awardXP(session.user.id, egg.xp_reward, 'easter_egg_found', egg.id)
  const unlockedAchievements = await evaluateAchievements(session.user.id)

  return NextResponse.json({ found: true, xp, unlockedAchievements })
}
