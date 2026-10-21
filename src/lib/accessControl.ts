import type { UserRole } from '@/types/database'

// Administração não é um papel que pode ser escolhido no cadastro público.
export const PUBLIC_ROLES = ['candidato', 'autonomo', 'empresa_owner'] as const satisfies readonly UserRole[]

export function isPublicRole(value: unknown): value is UserRole {
  return PUBLIC_ROLES.some(role => role === value)
}

export function hasAdminAccess(
  user: { id: string } | null,
  profile: { id: string; is_admin: boolean; is_active: boolean } | null,
): boolean {
  return Boolean(user && profile && profile.id === user.id && profile.is_active === true && profile.is_admin === true)
}
