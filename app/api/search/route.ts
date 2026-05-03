import { searchEntries } from '@/lib/search/orama'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') ?? ''
  const type = url.searchParams.get('type') ?? 'all'
  const results = await searchEntries({ q, type, limit: 30 })
  return NextResponse.json({ results })
}
