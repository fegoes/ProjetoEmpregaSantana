import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FEED_FILTERS,
  categoryCounts,
  clearPanelFilters,
  countPanelFilters,
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
    const filters = { ...withKind(DEFAULT_FEED_FILTERS, 'vagas'), categories: ['saude'], remoteOnly: true }
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
