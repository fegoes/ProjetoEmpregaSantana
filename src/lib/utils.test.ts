import { describe, expect, it } from 'vitest'
import { cn, matchesSearch, normalizeText } from './utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})

describe('safeInternalPath', () => {
  it('keeps internal paths and rejects external ones', async () => {
    const { safeInternalPath } = await import('./utils')
    expect(safeInternalPath('/vagas/1?candidatar=1')).toBe('/vagas/1?candidatar=1')
    expect(safeInternalPath('//evil.example')).toBeNull()
    expect(safeInternalPath('https://evil.example')).toBeNull()
    expect(safeInternalPath(null)).toBeNull()
  })
})

describe('busca do painel', () => {
  it('ignora acento e maiúscula', () => {
    expect(normalizeText('  Ação Rápida ')).toBe('acao rapida')
    expect(normalizeText(null)).toBe('')
  })

  it('todas as palavras digitadas precisam aparecer, em qualquer campo', () => {
    expect(matchesSearch('maria silva', 'Maria das Graças', 'silva@exemplo.com')).toBe(true)
    expect(matchesSearch('maria souza', 'Maria das Graças', 'silva@exemplo.com')).toBe(false)
  })

  it('acha com ou sem acento', () => {
    expect(matchesSearch('graca', 'Maria das Graças')).toBe(true)
    expect(matchesSearch('GRAÇAS', 'maria das gracas')).toBe(true)
  })

  it('busca vazia vale para tudo e campos vazios não atrapalham', () => {
    expect(matchesSearch('', 'qualquer coisa')).toBe(true)
    expect(matchesSearch('   ', null)).toBe(true)
    expect(matchesSearch('x', null, undefined, 'xis')).toBe(true)
  })
})
