import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { EntryBody } from '@/components/content/EntryBody'
import { CommentForm } from '@/components/comments/CommentForm'
import { CommentTree } from '@/components/comments/CommentTree'
import { Tag } from '@/components/ui/Tag'
import { Rune } from '@/components/ui/Rune'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Btn } from '@/components/ui/Btn'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { getEntryBySlug, getAllPublishedSlugs } from '@/lib/supabase/queries/entries'
import { getCommentTree } from '@/lib/supabase/queries/comments'
import { formatDateLong, readingTime } from '@/lib/utils/dates'
import { extractHeadings } from '@/lib/utils/tiptap'
import type { LevelNumber } from '@/components/ui/constants'
import { auth } from '@/auth'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs('chronicle')
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await getEntryBySlug(slug)
  if (!entry) return {}
  return {
    title: entry.title,
    description: entry.excerpt ?? undefined,
    openGraph: {
      title: entry.title,
      description: entry.excerpt ?? undefined,
      type: 'article',
      publishedTime: entry.publishedAt ? new Date(entry.publishedAt).toISOString() : undefined,
    },
  }
}

const REACTIONS = [
  { icon: '🍄', label: 'Magia',    color: 'var(--spore)' },
  { icon: '✦',  label: 'Brillante', color: 'var(--rune)' },
  { icon: '◊',  label: 'Inquieta', color: 'var(--mist)' },
  { icon: '☾',  label: 'Soñador',  color: 'var(--amethyst)' },
]

export default async function EntryPage({ params }: Props) {
  const { slug } = await params
  const entry = await getEntryBySlug(slug)
  if (!entry) notFound()

  const session = await auth()
  const comments = await getCommentTree(entry.id)
  const tags: string[]  = (() => { try { return JSON.parse(entry.tags) } catch { return [] } })()
  const headings        = extractHeadings(entry.body)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      {/* ── Cabecera ─────────────────────────────────────── */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px 0' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-mute)', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          <Link href="/cronicas" style={{ color: 'inherit', textDecoration: 'none' }}>Crónicas</Link>
          <span>›</span>
          {tags[0] && <Tag color="var(--mist)">{tags[0]}</Tag>}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: -1.2 }}>
          {entry.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
          <LevelBadge level={(entry.author?.level ?? 1) as LevelNumber} size={32} />
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500 }}>
              {entry.author?.name ?? 'La Cronista'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
              {formatDateLong(entry.publishedAt)} · {readingTime(entry.wordCount)} de lectura
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <Btn size="sm" variant="ghost">Compartir</Btn>
        </div>

        <ImagePlaceholder height={360} tone="mist" label={`ilustración · ${entry.title}`} />
      </article>

      {/* ── Cuerpo + márgenes ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 760px 1fr', padding: '56px 32px', alignItems: 'start' }}>

        {/* TOC — margen izquierdo */}
        {headings.length > 0 && (
          <div style={{ paddingLeft: 64, paddingRight: 32, position: 'sticky', top: 100 }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 16 }}>
              Índice del pergamino
            </div>
            {headings.map((h, i) => (
              <a
                key={i}
                href={`#${h.id}`}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  padding: `8px 0 8px ${(h.level - 2) * 12 + 14}px`,
                  borderLeft: '2px solid var(--border-soft)',
                  color: 'var(--text-mute)',
                  textDecoration: 'none',
                  paddingLeft: (h.level - 2) * 12 + 14,
                }}
              >
                {h.text}
              </a>
            ))}
          </div>
        )}
        {headings.length === 0 && <div />}

        {/* Cuerpo principal */}
        <main style={{ maxWidth: 760, margin: '0 auto' }}>
          <EntryBody body={entry.body} />
        </main>

        {/* Reacciones — margen derecho */}
        <div style={{ paddingRight: 64, paddingLeft: 32, position: 'sticky', top: 100 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 16 }}>
            Reacciona
          </div>
          {REACTIONS.map(r => (
            <button
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 14px',
                background: 'var(--moss-800)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
                marginBottom: 8,
                fontFamily: 'var(--font-ui)',
                color: 'var(--text)',
              }}
            >
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span style={{ fontSize: 13, flex: 1, textAlign: 'left' }}>{r.label}</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: r.color }}>0</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Comentarios ───────────────────────────────────── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '32px 32px 96px' }}>
        <RuneDivider char="✦ HILO DE LA TABERNA ✦" />
        <div style={{ marginTop: 32, marginBottom: 24, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: 0 }}>
            Comentarios
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>{comments.length} lacras</span>
        </div>
        {session?.user?.id ? (
          <CommentForm entryId={entry.id} />
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center', marginBottom: 24 }}>
            <Rune char="ᚺ" size={26} opacity={0.4} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic', marginTop: 12 }}>
              Inicia sesión para lacrar una palabra.
            </p>
            <Link href="/login">
              <Btn variant="rune" style={{ marginTop: 12 }}>Invocar sesión para comentar</Btn>
            </Link>
          </div>
        )}
        <CommentTree comments={comments} entryId={entry.id} currentUserId={session?.user?.id} currentUserRole={session?.user?.role} />
      </section>

      <Footer />
    </div>
  )
}
