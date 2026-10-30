import { describe, expect, it } from 'vitest'
import { PANEL_AREAS, afterLoginPath, areaFromPath, availableAreas, canOpenPath, landingPathFor, panelPathFor } from './panelNav'

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

describe('acompanhamento da contratação nos menus', () => {
  const links = (area: keyof typeof PANEL_AREAS) => PANEL_AREAS[area].groups.flatMap((g) => g.items.map((i) => i.to))

  it('a empresa tem a Seleção e o autônomo tem as Contratações', () => {
    expect(links('empresa')).toContain('/empresa/processos')
    expect(links('autonomo')).toContain('/autonomo/contratacoes')
  })

  it('o candidato acompanha pelas candidaturas', () => {
    expect(links('candidato')).toContain('/candidato/candidaturas')
  })

  it('cada endereço do menu pertence ao painel certo', () => {
    expect(areaFromPath('/empresa/processos/abc')).toBe('empresa')
    expect(areaFromPath('/autonomo/contratacoes/abc')).toBe('autonomo')
    expect(areaFromPath('/candidato/processos/abc')).toBe('candidato')
  })
})

describe('quem pode abrir o quê', () => {
  const admin = { isAdmin: true, roles: [] as const }
  const empresa = { isAdmin: false, roles: ['empresa_owner'] as const }

  it('superadmin sem perfil de empresa não abre telas de empresa, mas abre o /admin', () => {
    expect(canOpenPath('/admin', { ...admin, roles: [] })).toBe(true)
    expect(canOpenPath('/admin/usuarios', { ...admin, roles: [] })).toBe(true)
    expect(canOpenPath('/empresa/painel', { ...admin, roles: [] })).toBe(false)
  })

  it('empresa não abre o /admin', () => {
    expect(canOpenPath('/admin', { ...empresa, roles: ['empresa_owner'] })).toBe(false)
    expect(canOpenPath('/empresa/vagas?x=1', { ...empresa, roles: ['empresa_owner'] })).toBe(true)
  })

  it('endereços do site e da conta valem para todos; ativação de perfil também', () => {
    expect(canOpenPath('/vagas/123?candidatar=1', { isAdmin: false, roles: [] })).toBe(true)
    expect(canOpenPath('/perfil', { isAdmin: false, roles: [] })).toBe(true)
    expect(canOpenPath('/candidato/onboarding?voltar=%2Fvagas%2F1', { isAdmin: false, roles: [] })).toBe(true)
    expect(canOpenPath('/candidato/cv', { isAdmin: false, roles: [] })).toBe(false)
  })

  it('depois do login: o endereço pedido vale se a pessoa pode abri-lo', () => {
    expect(afterLoginPath('/vagas/9', '/', { isAdmin: false, roles: ['candidato'] })).toBe('/vagas/9')
    expect(afterLoginPath('/candidato/candidaturas', '/', { isAdmin: false, roles: ['candidato'] })).toBe('/candidato/candidaturas')
  })

  it('depois do login: endereço que a pessoa não pode abrir é trocado pelo painel dela', () => {
    expect(afterLoginPath('/empresa/painel', '/admin', { isAdmin: true, roles: [] })).toBe('/admin')
    expect(afterLoginPath('/admin', '/empresa/painel', { isAdmin: false, roles: ['empresa_owner'] })).toBe('/empresa/painel')
  })

  it('sem endereço pedido, vale o destino padrão (superadmin: /admin)', () => {
    expect(afterLoginPath(null, '/admin', { isAdmin: true, roles: [] })).toBe('/admin')
    expect(afterLoginPath(null, undefined, undefined)).toBe('/')
  })
})
