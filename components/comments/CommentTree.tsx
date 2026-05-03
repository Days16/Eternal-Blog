'use client'

import { useMemo } from 'react'
import { CommentNode } from './CommentNode'
import type { CommentFlat } from '@/lib/supabase/queries/comments'

type CommentTreeProps = {
  comments: CommentFlat[]
  entryId: string
  currentUserId?: string | null
  currentUserRole?: string | null
}

type CommentTreeNode = CommentFlat & { replies: CommentTreeNode[] }

function buildCommentTree(flatComments: CommentFlat[]) {
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

export function CommentTree({ comments, entryId, currentUserId, currentUserRole }: CommentTreeProps) {
  const tree = useMemo(() => buildCommentTree(comments), [comments])

  if (tree.length === 0) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-lg)', padding: 22, textAlign: 'center', color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
        Sé el primero en lacrar una palabra.
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      {tree.map(comment => (
        <CommentNode key={comment.id} comment={comment} entryId={entryId} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      ))}
    </div>
  )
}
