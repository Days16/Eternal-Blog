import { z } from 'zod'

export const CommentSchema = z.object({
  entryId:  z.string().uuid('entryId inválido'),
  body:     z.string().min(1, 'El comentario no puede estar vacío').max(2000),
  parentId: z.string().uuid().nullable().optional(),
})

export const ReactionSchema = z.object({
  entryId: z.string().uuid('entryId inválido'),
  kind:    z.enum(['magic', 'bright', 'uneasy', 'dreamer']),
})

export const ReadHistorySchema = z.object({
  entryId: z.string().uuid('entryId inválido'),
})

export const ProfileUpdateSchema = z.object({
  name:     z.string().min(1).max(80).optional(),
  bio:      z.string().max(500).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, 'Solo letras minúsculas, números, _ y -').optional(),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  tag:  z.string().max(50).optional(),
})

export type CommentInput     = z.infer<typeof CommentSchema>
export type ReactionInput    = z.infer<typeof ReactionSchema>
export type ReadHistoryInput = z.infer<typeof ReadHistorySchema>
export type ProfileInput     = z.infer<typeof ProfileUpdateSchema>
export type PaginationInput  = z.infer<typeof PaginationSchema>
