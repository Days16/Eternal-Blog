import Link from 'next/link'
import { getAdminComments } from '@/lib/supabase/queries/admin'
import { formatDate } from '@/lib/utils/dates'
import { Btn } from '@/components/ui/Btn'
import { deleteCommentAction, sealCommentAction } from '@/app/admin/actions'

export default async function AdminCommentsPage() {
  const comments = await getAdminComments()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, margin: '0 0 24px' }}>Moderación de Comentarios</h1>
      <div style={{ display: 'grid', gap: 16 }}>
        {comments.map(comment => (
          <article key={comment.id} style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-soft)', 
            borderRadius: 'var(--r-lg)', 
            padding: 20,
            opacity: comment.deleted ? 0.6 : 1,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mute)', marginBottom: 12 }}>
              <span>
                <strong style={{ color: 'var(--text)' }}>{comment.author?.name ?? comment.author?.username}</strong> 
                {' '}en <Link href={`/${comment.entry?.type === 'codex' ? 'codex' : 'cronicas'}/${comment.entry?.slug}`} style={{ color: 'var(--spore)', fontWeight: 600 }}>{comment.entry?.title}</Link>
              </span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span>{formatDate(comment.createdAt)}</span>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: 4, 
                  background: comment.deleted ? 'var(--ember-dim)' : comment.sealed ? 'var(--amethyst-dim)' : 'var(--moss-900)',
                  color: comment.deleted ? 'var(--ember)' : comment.sealed ? 'var(--amethyst)' : 'var(--spore)',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {comment.deleted ? 'Eliminado' : comment.sealed ? 'Sellado' : 'Visible'}
                </span>
              </div>
            </div>

            <div 
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }} 
              dangerouslySetInnerHTML={{ __html: comment.body ?? '' }} 
            />

            <div style={{ display: 'flex', gap: 8 }}>
              {!comment.deleted && (
                <>
                  <form action={sealCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <input type="hidden" name="sealed" value={String(comment.sealed)} />
                    <Btn type="submit" size="sm" variant="ghost" style={{ borderColor: 'var(--amethyst)', color: 'var(--amethyst)' }}>
                      {comment.sealed ? 'Desellar' : 'Sellar'}
                    </Btn>
                  </form>
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="id" value={comment.id} />
                    <Btn type="submit" size="sm" variant="ghost" style={{ borderColor: 'var(--ember)', color: 'var(--ember)' }}>
                      Eliminar
                    </Btn>
                  </form>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
