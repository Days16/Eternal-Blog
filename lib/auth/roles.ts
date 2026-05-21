export const SYSTEM_ROLES = ['visitor', 'reader', 'scribe', 'collaborator', 'moderator', 'dev', 'admin'] as const
export type UserRole = typeof SYSTEM_ROLES[number]

export function isValidRole(r: unknown): r is UserRole {
  return typeof r === 'string' && (SYSTEM_ROLES as readonly string[]).includes(r)
}

export function isModeratorOrAbove(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'moderator' || role === 'dev'
}

export function isCollaboratorOrAbove(role: string | null | undefined): boolean {
  return role === 'collaborator' || isModeratorOrAbove(role)
}
