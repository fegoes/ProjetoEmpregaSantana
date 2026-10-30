import { describe, expect, it } from 'vitest'
import type { VagaCardData } from '@/components/VagaCard'
import {
  DEFAULT_FEED_FILTERS,
  categoryCounts,
  clearPanelFilters,
  countPanelFilters,
  filterVagas,
  kindOf,
  withKind,
} from './feedFilters'

describe('feed kind selector', () => {
  it('round-trips through showVagas/showAutonomos', () => {
    expect(kindOf(DEFAULT_FEED_FILTERS)).toBe('todos')
    expect(kindOf(withKind(DEFAULT_FEED_FILTERS, 'vagas'))).toBe('vagas')
    expect(kindOf(withKind(DEFAULT_FEED_FILTERS, 'autonomos'))).toBe('autonomos')
  })
})

describe('panel filters', () => {
  it('counts and clears without touching the kind', () => {
    const filters = { ...withKind(DEFAULT_FEED_FILTERS, 'vagas'), categories: ['saude'], modalidades: ['modalidade-remota'] }
    expect(countPanelFilters(filters)).toBe(2)
    const cleared = clearPanelFilters(filters)
    expect(countPanelFilters(cleared)).toBe(0)
    expect(kindOf(cleared)).toBe('vagas')
  })
})

describe('categoryCounts', () => {
  it('orders categories by frequency and skips empty ones', () => {
    const counts = categoryCounts([{ category: 'vendas' }, { category: 'saude' }, { category: 'vendas' }], [
      { category: null },
      { category: 'saude' },
      { category: 'vendas' },
    ])
    expect([...counts.entries()]).toEqual([
      ['vendas', 3],
      ['saude', 2],
    ])
  })
})

describe('filtro por modalidade', () => {
  const vaga = (id: string, patch: Partial<VagaCardData>): VagaCardData => ({
    id,
    title: id,
    employment_type: 'clt',
    pricing_model: 'fixed_salary',
    location_city: null,
    location_state: null,
    is_remote: false,
    is_featured: false,
    empresas: null,
    ...patch,
  })
  const vagas = [
    vaga('a', { modalidade: 'modalidade-presencial' }),
    vaga('b', { modalidade: 'modalidade-hibrida' }),
    vaga('c', { modalidade: 'modalidade-remota', is_remote: true }),
    vaga('antiga-remota', { is_remote: true }),
    vaga('antiga-presencial', {}),
  ]
  const ids = (filters: Partial<typeof DEFAULT_FEED_FILTERS>) => filterVagas(vagas, { ...DEFAULT_FEED_FILTERS, ...filters }).map((v) => v.id)

  it('sem escolha mostra todas', () => {
    expect(ids({})).toHaveLength(5)
  })

  it('filtra por uma ou mais modalidades', () => {
    expect(ids({ modalidades: ['modalidade-hibrida'] })).toEqual(['b'])
    expect(ids({ modalidades: ['modalidade-hibrida', 'modalidade-presencial'] })).toEqual(['a', 'b', 'antiga-presencial'])
  })

  it('vaga antiga, sem modalidade, vale pelo campo remoto de antes', () => {
    expect(ids({ modalidades: ['modalidade-remota'] })).toEqual(['c', 'antiga-remota'])
  })
})
