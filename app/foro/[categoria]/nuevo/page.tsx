import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import { NewThreadForm } from '@/components/forum/NewThreadForm'
import { getForumCategoryBySlug } from '@/lib/supabase/queries/forum'
import { auth } from '@/auth'

type Props = { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const category = await getForumCategoryBySlug(categoria)
  if (!category) return {}
  return { title: `Nuevo hilo · ${category.name} · ETERNIDAD` }
}

export default async function NuevoHiloPage({ params }: Props) {
  const { categoria } = await params
  const [category, session] = await Promise.all([
    getForumCategoryBySlug(categoria),
    auth(),
  ])

  if (!category) notFound()
  if (!session?.user?.id) redirect('/login')

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="tex-canopy">
      <TopNav />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px)' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-ui)', fontSize: 11,
          color: 'var(--text-mute)', marginBottom: 32,
          textTransform: 'uppercase', letterSpacing: 1.5, flexWrap: 'wrap',
        }}>
          <Link href="/foro" style={{ color: 'inherit', textDecoration: 'none' }}>Foro</Link>
          <span>›</span>
          <Link href={`/foro/${categoria}`} style={{ color: 'inherit', textDecoration: 'none' }}>{category.name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-soft)' }}>Nuevo hilo</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 600,
          color: 'var(--text)',
          margin: '0 0 32px',
          letterSpacing: -0.5,
        }}>
          <span style={{ color: category.color, marginRight: 10 }}>{category.icon}</span>
          Nuevo pergamino en {category.name}
        </h1>

        <NewThreadForm categoryId={category.id} categorySlug={categoria} />
      </div>

      <Footer />
    </div>
  )
}
