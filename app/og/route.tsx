import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'ETERNIDAD'
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0b1119', color: '#d8c48f', alignItems: 'center', justifyContent: 'center', padding: 80, fontSize: 72, fontFamily: 'serif', textAlign: 'center' }}>
      ✦ {title} ✦
    </div>,
    { width: 1200, height: 630 },
  )
}
