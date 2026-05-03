import { auth } from '@/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = getSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })

  const { data, error } = await supabase
    .from('users')
    .select('level, xp, role, username')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  return NextResponse.json({
    level: data.level,
    xp: data.xp,
    role: data.role,
    username: data.username,
  })
}
