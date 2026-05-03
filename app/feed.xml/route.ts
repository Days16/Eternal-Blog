import { getRssChronicles } from '@/lib/supabase/queries/entries'

export async function GET() {
  const entries = await getRssChronicles(20)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const itemsXml = entries.map(entry => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${baseUrl}/cronicas/${entry.slug}</link>
      <guid>${baseUrl}/cronicas/${entry.slug}</guid>
      <pubDate>${entry.publishedAt ? new Date(entry.publishedAt).toUTCString() : ''}</pubDate>
      <description>${escapeXml(entry.excerpt || '')}</description>
    </item>
  `).join('')

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ETERNIDAD — Crónicas del Bosque</title>
    <link>${baseUrl}</link>
    <description>Relatos arcánicos y conocimientos del Codex de Eternidad.</description>
    <language>es-ES</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '"': return '&quot;'
      case "'": return '&apos;'
      default: return c
    }
  })
}
