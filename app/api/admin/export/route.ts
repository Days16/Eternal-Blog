import { getSession } from '@/lib/auth/session'
import { requireSupabase } from '@/lib/supabase/helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  const role = session?.user?.role
  if (!session?.user?.id || (role !== 'admin' && role !== 'dev')) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const supabase = requireSupabase()

  const [{ data: entries }, { data: codex }] = await Promise.all([
    supabase
      .from('entries')
      .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,created_at,updated_at')
      .eq('type', 'chronicle')
      .order('published_at', { ascending: false }),
    supabase
      .from('entries')
      .select('id,slug,type,title,excerpt,body,cover_url,tags,category,status,word_count,published_at,created_at,updated_at')
      .eq('type', 'codex')
      .order('title', { ascending: true }),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    site: 'ETERNIDAD',
    chronicles: entries ?? [],
    codex: codex ?? [],
  }

  const json = JSON.stringify(payload, null, 2)
  const filename = `eternidad-export-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
