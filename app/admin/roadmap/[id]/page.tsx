import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RoadmapForm } from '@/components/admin/RoadmapForm'
import { getRoadmapItemForAdmin } from '@/lib/supabase/queries/roadmap'

type Props = { params: Promise<{ id: string }> }

export default async function EditRoadmapItemPage({ params }: Props) {
  const { id } = await params
  const item = await getRoadmapItemForAdmin(id)
  if (!item) notFound()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/admin/roadmap"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'var(--text-mute)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          ← Volver al roadmap
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)', margin: '0 0 4px' }}>
          Editar ítem
        </h1>
        <p style={{
          color: 'var(--text-mute)',
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          margin: 0,
          fontStyle: 'italic',
        }}>
          &ldquo;{item.title}&rdquo;
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 32px',
      }}>
        <RoadmapForm item={item} />
      </div>
    </div>
  )
}
