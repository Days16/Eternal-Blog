import Link from 'next/link'
import { getAdminComments } from '@/lib/supabase/queries/admin'
import { formatDate } from '@/lib/utils/dates'

export default async function AdminCommentsPage() {
  const comments = await getAdminComments()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Comentarios</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {comments.map(comment => (
          <article key={comment.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)', marginBottom: 8 }}>
              <span>{comment.author?.name ?? comment.author?.username} en <Link href={`/${comment.entry?.type === 'codex' ? 'codex' : 'cronicas'}/${comment.entry?.slug}`} style={{ color: 'var(--spore)' }}>{comment.entry?.title}</Link></span>
              <span>{formatDate(comment.createdAt)} · {comment.deleted ? 'eliminado' : comment.sealed ? 'sellado' : 'visible'}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)' }} dangerouslySetInnerHTML={{ __html: comment.body ?? '' }} />
          </article>
        ))}
      </div>
    </div>
  )
}
