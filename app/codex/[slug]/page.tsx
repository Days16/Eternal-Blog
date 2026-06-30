import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { EntryBody } from '@/components/content/EntryBody'
import { ReadTracker } from '@/components/content/ReadTracker'
import { CommentForm } from '@/components/comments/CommentForm'
import { CommentTree } from '@/components/comments/CommentTree'
import { Tag } from '@/components/ui/Tag'
import { Rune } from '@/components/ui/Rune'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { Btn } from '@/components/ui/Btn'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { ReactionControl } from '@/components/content/ReactionControl'
import {
  getCodexArticle,
  getRelatedCodexEntries,
  getAllPublishedSlugs,
  CODEX_CATEGORIES,
} from '@/lib/supabase/queries/entries'
import { getCommentTree } from '@/lib/supabase/queries/comments'
import { formatDate, formatWords, relativeTime } from '@/lib/utils/dates'
import { parseTags } from '@/lib/utils/tags'
import { getSession } from '@/lib/auth/session'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs('codex')
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await getCodexArticle(slug)
  if (!entry) return {}
  const siteUrl = process.env.NEXT_PUBLIC_URL ?? 'https://eternidad.vercel.app'
  const ogUrl = `${siteUrl}/og?title=${encodeURIComponent(entry.title + ' · Codex')}`
  return {
    title: `${entry.title} · Codex`,
    description: entry.excerpt ?? undefined,
    openGraph: {
      title: `${entry.title} · Codex`,
      description: entry.excerpt ?? undefined,
      type: 'article',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: entry.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${entry.title} · Codex`,
      description: entry.excerpt ?? undefined,
      images: [ogUrl],
    },
  }
}

export default async function CodexArticlePage({ params }: Props) {
  const { slug } = await params
  const entry = await getCodexArticle(slug)
  if (!entry) notFound()

  const session = await getSession()
  const [comments, related] = await Promise.all([
    getCommentTree(entry.id).catch(() => []),
    getRelatedCodexEntries(entry.id, entry.category, 3).catch(() => []),
  ])
  const tags = parseTags(entry.tags)
  const cat = CODEX_CATEGORIES.find(c => c.id === entry.category)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* Breadcrumb */}
      <div style={{ padding: '32px 64px 0', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
        <Link href="/codex" style={{ color: 'inherit', textDecoration: 'none' }}>Codex</Link>
        <span>›</span>
        {cat && (
          <>
            <Link href={`/codex?category=${cat.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{cat.name}</Link>
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--spore)' }}>{entry.title}</span>
      </div>

      {/* Layout 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, padding: '32px 64px 96px' }}>

        {/* Cuerpo principal */}
        <main>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 500, lineHeight: 1, letterSpacing: -1.5, margin: '0 0 8px' }}>
            {entry.title}
          </h1>
          {entry.excerpt && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontStyle: 'italic', color: 'var(--moss-300)', marginBottom: 32 }}>
              &ldquo;{entry.excerpt}&rdquo;
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {cat && <Tag color={cat.color}>{cat.name}</Tag>}
            {tags.map(t => <Tag key={t} color="var(--moss-300)">{t}</Tag>)}
          </div>

          <EntryBody body={entry.body} />
          <ReadTracker entryId={entry.id} enabled={!!session?.user?.id} />

          {/* Entradas relacionadas */}
          {related.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginTop: 40 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 16 }}>
                Hilos relacionados
              </div>
              {related.map((r, i) => {
                const rCat = CODEX_CATEGORIES.find(c => c.id === r.category)
                return (
                  <Link
                    key={r.id}
                    href={`/codex/${r.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: i < related.length - 1 ? '1px solid var(--border-soft)' : 'none',
                      textDecoration: 'none',
                    }}
                  >
                    <Rune char={rCat?.rune ?? 'ᛟ'} size={14} opacity={0.7} />
                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>{r.title}</span>
                    {rCat && <Tag color={rCat.color}>{rCat.name}</Tag>}
                    <span style={{ color: 'var(--text-mute)' }}>→</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Comentarios */}
          <div style={{ marginTop: 48 }}>
            <RuneDivider char="✦ HILO DE LA TABERNA ✦" />
            <div style={{ marginTop: 24, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: 0 }}>Comentarios</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>{comments.length} lacras</span>
            </div>
            {session?.user?.id ? (
              <CommentForm entryId={entry.id} />
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center', marginBottom: 24 }}>
                <Rune char="ᚺ" size={24} opacity={0.4} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic', marginTop: 10 }}>
                  Inicia sesión para lacrar una palabra.
                </p>
                <Link href="/login">
                  <Btn variant="rune" style={{ marginTop: 12 }}>Invocar sesión para comentar</Btn>
                </Link>
              </div>
            )}
            <CommentTree comments={comments} entryId={entry.id} currentUserId={session?.user?.id} currentUserRole={session?.user?.role} />
          </div>
        </main>

        {/* Infobox lateral */}
        <aside>
          <div style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <ImagePlaceholder height={280} tone="forest" label={`retrato · ${entry.title}`} />
            <div style={{ padding: 20, borderTop: '1px solid var(--border-soft)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--rune)', marginBottom: 16, letterSpacing: 1, textAlign: 'center' }}>
                ✦ ficha ✦
              </div>
              {[
                ['Categoría', cat?.name ?? '—'],
                ['Palabras',  formatWords(entry.wordCount)],
                ['Actualizado', relativeTime(entry.updatedAt)],
                ['Publicado', formatDate(entry.publishedAt)],
                ['Autor', entry.author?.name ?? '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>{k}</span>
                  <span style={{ color: 'var(--text)', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ReactionControl entryId={entry.id} currentUserId={session?.user?.id} />
          </div>

          <div style={{ padding: 16, background: 'var(--moss-800)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--rune)', marginBottom: 8 }}>⚠ FICHA EN OBRA</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontStyle: 'italic', color: 'var(--text-mute)', lineHeight: 1.5 }}>
              Esta entrada se actualiza mientras avanza la obra. Los datos pueden cambiar.
            </div>
          </div>
          </div>{/* /sticky wrapper */}
        </aside>
      </div>

      <Footer />
    </div>
  )
}
