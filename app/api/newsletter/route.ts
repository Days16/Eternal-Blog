import { auth } from '@/auth'
import { requireSupabase } from '@/lib/supabase/helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ subscribed: false })

  const supabase = requireSupabase()
  const { data } = await supabase
    .from('users')
    .select('notify_new_posts')
    .eq('id', session.user.id)
    .maybeSingle()

  return NextResponse.json({ subscribed: !!(data as { notify_new_posts?: boolean } | null)?.notify_new_posts })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { subscribe?: boolean }
  const subscribe = Boolean(body.subscribe)

  const supabase = requireSupabase()
  const { error } = await supabase
    .from('users')
    .update({ notify_new_posts: subscribe, updated_at: new Date().toISOString() })
    .eq('id', session.user.id)

  if (error) return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })

  return NextResponse.json({ subscribed: subscribe })
}
