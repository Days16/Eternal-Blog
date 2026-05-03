import { getRssChronicles } from '@/lib/supabase/queries/entries'

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://eternidad.vercel.app'

export async function GET() {
  const entries = await getRssChronicles(20)

  const items = entries
    .filter(e => e.publishedAt)
    .map(e => {
      const url = `${BASE_URL}/cronicas/${e.slug}`
      const summary = e.excerpt ? `<summary>${escapeXml(e.excerpt)}</summary>` : ''
      return `
  <entry>
    <id>${escapeXml(url)}</id>
    <title>${escapeXml(e.title)}</title>
    <link href="${escapeXml(url)}" />
    <updated>${new Date(e.publishedAt!).toISOString()}</updated>
    <published>${new Date(e.publishedAt!).toISOString()}</published>
    ${e.author?.name ? `<author><name>${escapeXml(e.author.name)}</name></author>` : ''}
    ${summary}
  </entry>`
    })
    .join('\n')

  const lastUpdated =
    entries[0]?.publishedAt
      ? new Date(entries[0].publishedAt).toISOString()
      : new Date().toISOString()

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${BASE_URL}/feed.xml</id>
  <title>ETERNIDAD · Crónicas</title>
  <subtitle>Notas de campo, guías de escritura y fragmentos del bosque.</subtitle>
  <link href="${BASE_URL}/feed.xml" rel="self" type="application/atom+xml" />
  <link href="${BASE_URL}/cronicas" rel="alternate" type="text/html" />
  <updated>${lastUpdated}</updated>
  <author><name>La Cronista</name></author>
${items}
</feed>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
