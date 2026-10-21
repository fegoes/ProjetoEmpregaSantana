import { describe, expect, it } from 'vitest'
import { cn, contarRecentes, publicadaHa } from './utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})

describe('publicadaHa', () => {
  const diasAtras = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

  it('trata hoje e ontem como palavras, não como números', () => {
    expect(publicadaHa(diasAtras(0))).toBe('hoje')
    expect(publicadaHa(diasAtras(1))).toBe('ontem')
  })

  it('conta em dias dentro do primeiro mês', () => {
    expect(publicadaHa(diasAtras(5))).toBe('há 5 dias')
  })

  it('passa a meses depois de 30 dias', () => {
    expect(publicadaHa(diasAtras(45))).toBe('há 1 mês')
    expect(publicadaHa(diasAtras(100))).toBe('há 3 meses')
  })

  it('devolve null para entrada ausente ou inválida', () => {
    expect(publicadaHa(null)).toBeNull()
    expect(publicadaHa('não é data')).toBeNull()
  })

  it('devolve null para data no futuro em vez de dizer "há -3 dias"', () => {
    expect(publicadaHa(new Date(Date.now() + 3 * 86_400_000).toISOString())).toBeNull()
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
