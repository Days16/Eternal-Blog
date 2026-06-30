import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { RuneDivider } from '@/components/ui/RuneDivider'
import { Btn } from '@/components/ui/Btn'
import { ThreadCard } from '@/components/forum/ThreadCard'
import { getForumCategoryBySlug, getForumThreads } from '@/lib/supabase/queries/forum'
import { getSession } from '@/lib/auth/session'

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const category = await getForumCategoryBySlug(categoria)
  if (!category) return {}
  return {
    title: `${category.name} · Foro · ETERNIDAD`,
    description: category.description ?? undefined,
  }
}

export default async function ForoCategoriaPage({ params, searchParams }: Props) {
  const { categoria } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const [category, session] = await Promise.all([
    getForumCategoryBySlug(categoria),
    getSession(),
  ])

  if (!category) notFound()

  const { threads, total } = await getForumThreads(category.id, page)

  const THREADS_PER_PAGE = 20
  const hasPrev = page > 1
  const hasNext = page * THREADS_PER_PAGE < total
  const isLoggedIn = !!session?.user?.id

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px)' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-ui)', fontSize: 11,
          color: 'var(--text-mute)', marginBottom: 32,
          textTransform: 'uppercase', letterSpacing: 1.5, flexWrap: 'wrap',
        }}>
          <Link href="/foro" style={{ color: 'inherit', textDecoration: 'none' }}>Foro</Link>
          <span>›</span>
          <span style={{ color: category.color }}>{category.icon}</span>
          <span style={{ color: 'var(--text-soft)' }}>{category.name}</span>
        </nav>

        {/* Cabecera de la categoría */}
        <div className="reveal" style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 36,
          flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 600,
              color: 'var(--text)',
              margin: '0 0 8px',
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}>
              <span style={{ color: category.color, marginRight: 12 }}>{category.icon}</span>
              {category.name}
            </h1>
            {category.description && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-soft)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                {category.description}
              </p>
            )}
          </div>

          {isLoggedIn && (
            <Link href={`/foro/${categoria}/nuevo`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Btn variant="rune">+ Nuevo hilo</Btn>
            </Link>
          )}
        </div>

        <RuneDivider char={`✦ ${total} HILO${total !== 1 ? 'S' : ''} ✦`} />

        {/* Lista de hilos */}
        {threads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, marginBottom: 16, opacity: 0.3 }}>
              {category.icon}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-mute)', fontStyle: 'italic' }}>
              Aún no hay pergaminos en esta sala.
            </p>
            {isLoggedIn ? (
              <Link href={`/foro/${categoria}/nuevo`} style={{ textDecoration: 'none', display: 'inline-block', marginTop: 20 }}>
                <Btn variant="rune">Ser el primero en escribir</Btn>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 20 }}>
                <Btn variant="ghost">Invocar sesión para participar</Btn>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {threads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} categorySlug={categoria} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {(hasPrev || hasNext) && (
          <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center' }}>
            {hasPrev && (
              <Link href={`/foro/${categoria}?page=${page - 1}`}>
                <Btn variant="ghost">Anterior</Btn>
              </Link>
            )}
            {hasNext && (
              <Link href={`/foro/${categoria}?page=${page + 1}`}>
                <Btn variant="rune">Siguiente</Btn>
              </Link>
            )}
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
