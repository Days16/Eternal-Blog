import { isMarketplaceEnabled } from '@/lib/supabase/queries/marketplace'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const enabled = await isMarketplaceEnabled()
  return NextResponse.json({ enabled })
}
