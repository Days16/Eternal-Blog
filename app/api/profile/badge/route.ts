import { getSession } from '@/lib/auth/session'
import { setActiveBadge, getUserAchievements, getUserActiveBadge } from '@/lib/supabase/queries/users'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }
  const [achievements, active] = await Promise.all([
    getUserAchievements(session.user.id),
    getUserActiveBadge(session.user.id),
  ])
  const badgeAchievements = achievements.filter(a => a.unlocked && a.hasNameBadge)
  return NextResponse.json({ badges: badgeAchievements, activeId: active?.id ?? null })
}

const schema = z.object({
  achievementId: z.string().uuid().nullable(),
})

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await setActiveBadge(session.user.id, parsed.data.achievementId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el badge.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
