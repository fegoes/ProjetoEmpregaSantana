import { describe, expect, it } from 'vitest'
import { hasAdminAccess, isPublicRole, PUBLIC_ROLES } from './accessControl'

describe('modelo de acesso', () => {
  it('cadastro público aceita apenas os três papéis da plataforma', () => {
    expect(PUBLIC_ROLES).toEqual(['candidato', 'autonomo', 'empresa_owner'])
    expect(PUBLIC_ROLES.every(isPublicRole)).toBe(true)
    for (const role of ['admin', 'administrador', 'service_role', '', null, true]) expect(isPublicRole(role)).toBe(false)
  })
  it('exige perfil ativo e autorizado do mesmo usuário da sessão', () => {
    const user = { id: 'ordinary', user_metadata: { is_admin: true } }
    expect(hasAdminAccess(user, { id: 'ordinary', is_admin: false, is_active: true })).toBe(false)
    expect(hasAdminAccess(user, { id: 'previous-admin', is_admin: true, is_active: true })).toBe(false)
    expect(hasAdminAccess(user, { id: 'ordinary', is_admin: true, is_active: false })).toBe(false)
    expect(hasAdminAccess(null, { id: 'ordinary', is_admin: true, is_active: true })).toBe(false)
    expect(hasAdminAccess(user, null)).toBe(false)
    expect(hasAdminAccess(user, { id: 'ordinary', is_admin: true, is_active: true })).toBe(true)
  })
})
