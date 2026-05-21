import { searchEntries, searchUsers } from '@/lib/search/orama'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url  = new URL(request.url)
  const q    = url.searchParams.get('q')    ?? ''
  const type = url.searchParams.get('type') ?? 'all'

  if (!q.trim()) {
    return NextResponse.json({ results: [], users: [] })
  }

  try {
    if (type === 'users') {
      const users = await searchUsers({ q, limit: 20 })
      return NextResponse.json({ results: [], users })
    }

    const [results, users] = await Promise.all([
      searchEntries({ q, type, limit: 30 }),
      type === 'all' ? searchUsers({ q, limit: 8 }) : Promise.resolve([]),
    ])

    return NextResponse.json({ results, users })
  } catch (err) {
    console.error('[api/search] error:', err)
    return NextResponse.json({ results: [], users: [] })
  }
}
