import { auth } from '@/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { mapActivity } from '@/lib/supabase/helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = getSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data.map(mapActivity))
}
