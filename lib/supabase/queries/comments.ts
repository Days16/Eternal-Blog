import { sanitizeCommentHtml, stripHtml } from '@/lib/utils/sanitize'
import { mapUser, requireSupabase, toDate } from '@/lib/supabase/helpers'

export type CommentFlat = Awaited<ReturnType<typeof getCommentTree>>[number]
export type CommentTreeNode = CommentFlat & { replies: CommentTreeNode[] }

export async function getCommentTree(entryId: string) {
  const supabase = requireSupabase()
  const { data } = await supabase
    .from('comments')
    .select('id,entry_id,user_id,body,parent_id,depth,path,sealed,deleted,created_at,updated_at')
    .eq('entry_id', entryId)
    .order('path', { ascending: true })
    .order('created_at', { ascending: true })

  const rows = data ?? []
  const userIds = [...new Set(rows.map(row => row.user_id).filter(Boolean))]
  const { data: authors } = userIds.length
    ? await supabase.from('users').select('id,name,username,avatar_url,image,role,level').in('id', userIds)
    : { data: [] }

  const byId = new Map((authors ?? []).map(author => [author.id, mapUser(author)]))

  return rows.map(row => ({
    id: row.id,
    entryId: row.entry_id,
    userId: row.user_id,
    body: row.body,
    parentId: row.parent_id,
    depth: row.depth ?? 0,
    path: row.path,
    sealed: row.sealed ?? false,
    deleted: row.deleted ?? false,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
    author: byId.get(row.user_id) ?? {
      id: row.user_id,
      name: null,
      username: null,
      avatarUrl: null,
      image: null,
      role: 'reader',
      level: 1,
    },
  }))
}

export function buildCommentTree(flatComments: CommentFlat[]) {
  const byId = new Map<string, CommentTreeNode>()
  const roots: CommentTreeNode[] = []

  for (const comment of flatComments) {
    byId.set(comment.id, { ...comment, replies: [] })
  }

  for (const comment of byId.values()) {
    if (comment.parentId) {
      const parent = byId.get(comment.parentId)
      if (parent) parent.replies.push(comment)
      else roots.push(comment)
    } else {
      roots.push(comment)
    }
  }

  return roots
}

export async function createComment(input: { entryId: string; userId: string; body: string; parentId?: string | null }) {
  const body = sanitizeCommentHtml(input.body)
  if (!stripHtml(body).replaceAll('&nbsp;', '').trim()) throw new Error('El comentario no puede estar vacío')
  const supabase = requireSupabase()

  let depth = 0
  let pathPrefix = ''

  if (input.parentId) {
    const { data: parent } = await supabase
      .from('comments')
      .select('id,depth,path,sealed,deleted')
      .eq('id', input.parentId)
      .eq('entry_id', input.entryId)
      .maybeSingle()

    if (!parent) throw new Error('Comentario padre no encontrado')
    if (parent.sealed || parent.deleted) throw new Error('No se puede responder a este comentario')
    depth = parent.depth + 1
    pathPrefix = `${parent.path}/`
  }

  const id = crypto.randomUUID()
  const { data: created, error } = await supabase
    .from('comments')
    .insert({
      id,
      entry_id: input.entryId,
      user_id: input.userId,
      body,
      parent_id: input.parentId ?? null,
      depth,
      path: `${pathPrefix}${id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id,entry_id,user_id,body,parent_id,depth,path,sealed,deleted,created_at,updated_at')
    .single()

  if (error) throw new Error(error.message)

  return {
    id: created.id,
    entryId: created.entry_id,
    userId: created.user_id,
    body: created.body,
    parentId: created.parent_id,
    depth: created.depth,
    path: created.path,
    sealed: created.sealed,
    deleted: created.deleted,
    createdAt: toDate(created.created_at),
    updatedAt: toDate(created.updated_at),
  }
}

export async function deleteComment(id: string, userId: string, canModerate = false) {
  const supabase = requireSupabase()
  const { data: comment } = await supabase
    .from('comments')
    .select('id,user_id')
    .eq('id', id)
    .maybeSingle()

  if (!comment) return null
  if (!canModerate && comment.user_id !== userId) throw new Error('No puedes eliminar este comentario')

  const { data: updated } = await supabase
    .from('comments')
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  return updated
}

export async function sealComment(id: string) {
  const supabase = requireSupabase()
  const { data: updated } = await supabase
    .from('comments')
    .update({ sealed: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  return updated ?? null
}
