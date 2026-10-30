import { describe, expect, it } from 'vitest'
import { activeFor, inScope, slugify, uniqueSlug, type Category } from './categories'

const cat = (slug: string, kind: Category['kind'], is_active = true): Category => ({ id: slug, slug, label: slug, kind, is_active })

describe('slugify / uniqueSlug', () => {
  it('removes accents and symbols', () => {
    expect(slugify('Mão de obra')).toBe('mao-de-obra')
    expect(slugify('Design & Marketing')).toBe('design-e-marketing')
    expect(slugify('  Técnico (TI)  ')).toBe('tecnico-ti')
  })

  it('avoids repeated slugs and prefixes company segments', () => {
    expect(uniqueSlug('Vendas', ['vendas'], 'vaga')).toBe('vendas-2')
    expect(uniqueSlug('Vendas', ['vendas', 'vendas-2'], 'vaga')).toBe('vendas-3')
    expect(uniqueSlug('Saúde', [], 'empresa')).toBe('segmento-saude')
    expect(uniqueSlug('???', [], 'vaga')).toBe('categoria')
  })
})

describe('scopes', () => {
  it('shows "both" categories on the vaga and autonomo tabs, never on segments', () => {
    expect(inScope(cat('a', 'both'), 'vaga')).toBe(true)
    expect(inScope(cat('a', 'both'), 'autonomo')).toBe(true)
    expect(inScope(cat('a', 'both'), 'empresa')).toBe(false)
    expect(inScope(cat('s', 'empresa'), 'vaga')).toBe(false)
  })

  it('hides inactive categories from forms but keeps the one already chosen', () => {
    const list = [cat('a', 'vaga'), cat('b', 'vaga', false), cat('c', 'autonomo')]
    expect(activeFor(list, 'vaga').map((c) => c.slug)).toEqual(['a'])
    expect(activeFor(list, 'vaga', 'b').map((c) => c.slug)).toEqual(['a', 'b'])
    expect(activeFor(undefined, 'vaga')).toEqual([])
  })

  it('treats a missing is_active (old database) as active', () => {
    const old = { id: 'x', slug: 'x', label: 'x', kind: 'vaga' } as Category
    expect(activeFor([old], 'vaga')).toHaveLength(1)
  })
})
