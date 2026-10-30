import { describe, expect, it } from 'vitest'
import { areaFromPath, availableAreas, landingPathFor, panelPathFor } from './panelNav'

describe('areaFromPath', () => {
  it('maps each address to its panel', () => {
    expect(areaFromPath('/admin')).toBe('admin')
    expect(areaFromPath('/admin/categorias')).toBe('admin')
    expect(areaFromPath('/empresa/vagas/nova')).toBe('empresa')
    expect(areaFromPath('/empresa/onboarding')).toBe('empresa')
    expect(areaFromPath('/candidato/cv/123')).toBe('candidato')
    expect(areaFromPath('/autonomo/perfil')).toBe('autonomo')
    expect(areaFromPath('/perfil')).toBe('conta')
    expect(areaFromPath('/perfil/conta')).toBe('conta')
  })

  it('does not treat unrelated addresses as admin', () => {
    expect(areaFromPath('/administracao')).toBe('conta')
  })
})

describe('availableAreas', () => {
  it('keeps superadmin separate from the company profile', () => {
    expect(availableAreas({ isAdmin: true, roles: [] })).toEqual(['admin'])
    expect(availableAreas({ isAdmin: true, roles: ['empresa_owner'] })).toEqual(['admin', 'empresa'])
  })

  it('lists the profiles a user has, in a stable order', () => {
    expect(availableAreas({ isAdmin: false, roles: ['autonomo', 'candidato', 'empresa_owner'] })).toEqual([
      'empresa',
      'candidato',
      'autonomo',
    ])
    expect(availableAreas({ isAdmin: false, roles: [] })).toEqual([])
  })
})

describe('panelPathFor', () => {
  it('opens the first profile panel', () => {
    expect(panelPathFor({ isAdmin: true, roles: ['empresa_owner'] })).toBe('/admin')
    expect(panelPathFor({ isAdmin: false, roles: ['candidato'] })).toBe('/candidato/candidaturas')
    expect(panelPathFor({ isAdmin: false, roles: ['autonomo'] })).toBe('/autonomo/perfil')
  })

  it('falls back to the profiles page when there is no profile yet', () => {
    expect(panelPathFor({ isAdmin: false, roles: [] })).toBe('/perfil')
  })
})

describe('landingPathFor', () => {
  it('sends admins and companies to the panel and everyone else to the site', () => {
    expect(landingPathFor({ isAdmin: true, roles: ['empresa_owner'] })).toBe('/admin')
    expect(landingPathFor({ isAdmin: false, roles: ['empresa_owner', 'candidato'] })).toBe('/empresa/painel')
    expect(landingPathFor({ isAdmin: false, roles: ['candidato'] })).toBe('/')
    expect(landingPathFor({ isAdmin: false, roles: ['autonomo'] })).toBe('/')
    expect(landingPathFor({ isAdmin: false, roles: [] })).toBe('/')
  })
})
