import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Btn } from '@/components/ui/Btn'
import { Rune } from '@/components/ui/Rune'
import { ReplyForm } from '@/components/forum/ReplyForm'
import { ReplyNode } from '@/components/forum/ReplyNode'
import { getForumThread, isFollowingThread } from '@/lib/supabase/queries/forum'
import { formatDateLong } from '@/lib/utils/dates'
import { togglePinThreadAction, toggleLockThreadAction } from '@/app/foro/actions'
import { FollowThreadButton } from '@/components/forum/FollowThreadButton'
import { DeleteThreadButton } from '@/components/forum/DeleteThreadButton'
import { auth } from '@/auth'
import type { LevelNumber } from '@/components/ui/constants'

type Props = { params: Promise<{ categoria: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, slug } = await params
  const thread = await getForumThread(categoria, slug)
  if (!thread) return {}
  return {
    title: `${thread.title} · ${thread.category.name} · Foro`,
    description: thread.body.replace(/<[^>]+>/g, '').slice(0, 160),
  }
}

export default async function ForoThreadPage({ params }: Props) {
  const { categoria, slug } = await params
  const [thread, session] = await Promise.all([
    getForumThread(categoria, slug),
    auth(),
  ])

  if (!thread) notFound()

  const userId = session?.user?.id
  const role = session?.user?.role
  const canModerate = role === 'admin' || role === 'dev' || role === 'moderator'
  const isAuthor = userId === thread.authorId
  const isFollowing = userId ? await isFollowingThread(userId, thread.id) : false

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px)' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-ui)', fontSize: 11,
          color: 'var(--text-mute)', marginBottom: 32,
          textTransform: 'uppercase', letterSpacing: 1.5, flexWrap: 'wrap',
        }}>
          <Link href="/foro" style={{ color: 'inherit', textDecoration: 'none' }}>Foro</Link>
          <span>›</span>
          <Link href={`/foro/${categoria}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            <span style={{ color: thread.category.color }}>{thread.category.icon}</span>
            {' '}{thread.category.name}
          </Link>
        </nav>

        {/* ── Cabecera del hilo ─────────────────────────── */}
        <div className="reveal" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {thread.pinned && (
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
                color: 'var(--spore)', border: '1px solid var(--spore)',
                borderRadius: 4, padding: '2px 6px',
                textTransform: 'uppercase', letterSpacing: 1.5,
              }}>
                Fijado
              </span>
            )}
            {thread.locked && (
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
                color: 'var(--text-mute)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '2px 6px',
                textTransform: 'uppercase', letterSpacing: 1.5,
              }}>
                Cerrado
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 5vw, 40px)',
            fontWeight: 600,
            color: 'var(--text)',
            margin: '0 0 20px',
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}>
            {thread.title}
          </h1>

          {/* Meta del autor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
            <LevelBadge level={(thread.author?.level ?? 1) as LevelNumber} size={32} />
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500 }}>
                {thread.author?.name ?? thread.author?.username ?? 'Anónimo'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                {formatDateLong(thread.createdAt)} · {thread.views} lecturas
              </div>
            </div>

            {userId && (
              <div style={{ marginLeft: canModerate ? 12 : 'auto' }}>
                <FollowThreadButton threadId={thread.id} initialFollowing={isFollowing} />
              </div>
            )}

            {/* Admin actions */}
            {canModerate && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <form action={togglePinThreadAction} style={{ display: 'inline' }}>
                  <input type="hidden" name="thread_id" value={thread.id} />
                  <input type="hidden" name="pinned" value={String(thread.pinned)} />
                  <input type="hidden" name="category_slug" value={categoria} />
                  <input type="hidden" name="thread_slug" value={slug} />
                  <Btn type="submit" variant="ghost" size="sm">
                    {thread.pinned ? 'Desfijar' : 'Fijar'}
                  </Btn>
                </form>
                <form action={toggleLockThreadAction} style={{ display: 'inline' }}>
                  <input type="hidden" name="thread_id" value={thread.id} />
                  <input type="hidden" name="locked" value={String(thread.locked)} />
                  <input type="hidden" name="category_slug" value={categoria} />
                  <input type="hidden" name="thread_slug" value={slug} />
                  <Btn type="submit" variant="ghost" size="sm">
                    {thread.locked ? 'Desbloquear' : 'Cerrar hilo'}
                  </Btn>
                </form>
              </div>
            )}

            {(isAuthor || canModerate) && (
              <DeleteThreadButton threadId={thread.id} categorySlug={categoria} />
            )}
          </div>

          {/* Cuerpo del hilo */}
          <div className="reveal reveal-1" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-lg)',
            padding: '24px 28px',
          }}>
            <div
              style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-soft)', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: thread.body }}
            />
          </div>
        </div>

        {/* ── Respuestas ───────────────────────────────── */}
        <RuneDivider char={`✦ ${thread.replies.length} RESPUESTA${thread.replies.length !== 1 ? 'S' : ''} ✦`} />

        {thread.replies.length === 0 && !thread.locked && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic', textAlign: 'center', margin: '32px 0' }}>
            Sé el primero en responder a este pergamino.
          </p>
        )}

        {thread.replies.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {thread.replies.map((reply, i) => (
              <div key={reply.id} className="reply-node" style={{ animationDelay: `${Math.min(i * 70, 350)}ms` }}>
                <ReplyNode
                  reply={reply}
                  categorySlug={categoria}
                  threadSlug={slug}
                  threadId={thread.id}
                  currentUserId={userId}
                  canModerate={canModerate}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Formulario de respuesta ──────────────────── */}
        <div style={{ marginTop: 48 }}>
          <RuneDivider char="✦ TU RESPUESTA ✦" />
          <div style={{ marginTop: 24 }}>
            {thread.locked ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                textAlign: 'center',
              }}>
                <Rune char="ᛏ" size={24} opacity={0.4} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-mute)', fontStyle: 'italic', marginTop: 12 }}>
                  Este hilo está cerrado. No se aceptan nuevas respuestas.
                </p>
              </div>
            ) : userId ? (
              <ReplyForm
                threadId={thread.id}
                categorySlug={categoria}
                threadSlug={slug}
              />
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                textAlign: 'center',
              }}>
                <Rune char="ᚺ" size={26} opacity={0.4} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mute)', fontStyle: 'italic', marginTop: 12 }}>
                  Inicia sesión para dejar tu pergamino.
                </p>
                <Link href="/login">
                  <Btn variant="rune" style={{ marginTop: 12 }}>Invocar sesión</Btn>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Volver */}
        <div style={{ marginTop: 48 }}>
          <Link href={`/foro/${categoria}`} style={{ textDecoration: 'none' }}>
            <Btn variant="ghost" size="sm">← Volver a {thread.category.name}</Btn>
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  )
}
