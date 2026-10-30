import { describe, expect, it } from 'vitest'
import { MODALIDADE_PRESENCIAL, MODALIDADE_REMOTA, modalidadeLabels, modalidadeLocal, vagaModalidade } from '@/lib/modalidade'
import type { Category } from '@/lib/categories'

const cat = (slug: string, label: string, kind: Category['kind'] = 'modalidade'): Category => ({ id: slug, slug, label, kind, is_active: true })
const labels = modalidadeLabels([
  cat('modalidade-presencial', 'Presencial'),
  cat('modalidade-remota', 'Remota'),
  cat('modalidade-hibrida', 'Híbrida'),
  cat('vendas', 'Vendas', 'vaga'),
])
const vaga = (patch: object) => ({ modalidade: null, is_remote: false, location_city: 'Santana do Ipanema', location_state: 'AL', ...patch })

describe('vagaModalidade', () => {
  it('usa a modalidade escolhida', () => {
    expect(vagaModalidade({ modalidade: 'modalidade-hibrida', is_remote: false })).toBe('modalidade-hibrida')
  })
  it('vaga antiga vale pelo campo remoto de antes', () => {
    expect(vagaModalidade({ modalidade: null, is_remote: true })).toBe(MODALIDADE_REMOTA)
    expect(vagaModalidade({ is_remote: false })).toBe(MODALIDADE_PRESENCIAL)
  })
})

describe('modalidadeLabels', () => {
  it('guarda só as categorias do tipo modalidade', () => {
    expect([...labels.keys()]).toEqual(['modalidade-presencial', 'modalidade-remota', 'modalidade-hibrida'])
  })
})

describe('modalidadeLocal', () => {
  it('presencial mostra só a cidade', () => {
    expect(modalidadeLocal(vaga({ modalidade: 'modalidade-presencial' }), labels)).toBe('Santana do Ipanema, AL')
  })
  it('híbrida mostra o nome da modalidade e a cidade', () => {
    expect(modalidadeLocal(vaga({ modalidade: 'modalidade-hibrida' }), labels)).toBe('Híbrida · Santana do Ipanema, AL')
  })
  it('remota mostra só o nome, sem cidade', () => {
    expect(modalidadeLocal(vaga({ modalidade: 'modalidade-remota', is_remote: true, location_city: null, location_state: null }), labels)).toBe('Remota')
  })
  it('usa o nome que o superadmin escreveu', () => {
    const renamed = new Map([['modalidade-remota', 'Home office']])
    expect(modalidadeLocal(vaga({ modalidade: 'modalidade-remota', is_remote: true }), renamed)).toBe('Home office')
  })
  it('sem a lista de nomes (carregando) volta ao texto de sempre', () => {
    expect(modalidadeLocal(vaga({ is_remote: true }))).toBe('Remoto')
    expect(modalidadeLocal(vaga({}))).toBe('Santana do Ipanema, AL')
  })
  it('modalidade nova sem cidade mostra só o nome', () => {
    const custom = new Map([['modalidade-semi', 'Semipresencial']])
    expect(modalidadeLocal(vaga({ modalidade: 'modalidade-semi', location_city: null, location_state: null }), custom)).toBe('Semipresencial')
  })
})
