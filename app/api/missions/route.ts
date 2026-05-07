import { auth } from '@/auth'
import { getUserMissionState } from '@/lib/missions/evaluator'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const missions = await getUserMissionState(session.user.id)
  return NextResponse.json(missions)
}
