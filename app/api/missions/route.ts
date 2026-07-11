import { getSession } from '@/lib/auth/session'
import { getUserMissionState } from '@/lib/missions/evaluator'
import { withRouteErrors } from '@/lib/utils/api-error'
import { NextResponse } from 'next/server'

export const GET = withRouteErrors('missions:GET', async () => {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const missions = await getUserMissionState(session.user.id)
  return NextResponse.json(missions)
})
