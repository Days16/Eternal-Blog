import { getSession } from '@/lib/auth/session'
import { getUserMissionState } from '@/lib/missions/evaluator'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const missions = await getUserMissionState(session.user.id)
  return NextResponse.json(missions)
}
