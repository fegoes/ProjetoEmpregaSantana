import { describe, expect, it } from 'vitest'
import { cn, contarRecentes } from './utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})

describe('contarRecentes', () => {
  const diasAtras = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

  it('conta só o que está dentro da janela', () => {
    const itens = [{ created_at: diasAtras(1) }, { created_at: diasAtras(3) }, { created_at: diasAtras(20) }]
    expect(contarRecentes(itens, 7)).toBe(2)
  })

  it('ignora itens sem data', () => {
    expect(contarRecentes([{ created_at: null }, { created_at: undefined }], 7)).toBe(0)
  })
})
