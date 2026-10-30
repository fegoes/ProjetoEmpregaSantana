import { describe, expect, it } from 'vitest'
import {
  formatMoneyInput,
  isCompleteCep,
  isValidCnpj,
  maskCep,
  maskCnpj,
  maskPhone,
  parseMoneyInput,
  titleCasePt,
} from './masks'

describe('maskPhone', () => {
  it('formats while typing', () => {
    expect(maskPhone('8')).toBe('(8')
    expect(maskPhone('82')).toBe('(82')
    expect(maskPhone('829')).toBe('(82) 9')
    expect(maskPhone('82999990')).toBe('(82) 9999-90')
    expect(maskPhone('82999990000')).toBe('(82) 99999-0000')
  })

  it('handles landlines, pasted numbers with +55 and stray characters', () => {
    expect(maskPhone('8233330000')).toBe('(82) 3333-0000')
    expect(maskPhone('+55 (82) 99999-0000')).toBe('(82) 99999-0000')
    expect(maskPhone('')).toBe('')
    expect(maskPhone('abc')).toBe('')
  })
})

describe('maskCnpj / maskCep', () => {
  it('applies the document masks', () => {
    expect(maskCnpj('12345678000195')).toBe('12.345.678/0001-95')
    expect(maskCnpj('12345')).toBe('12.345')
    expect(maskCep('57500000')).toBe('57500-000')
    expect(maskCep('575')).toBe('575')
    expect(isCompleteCep('57500-000')).toBe(true)
    expect(isCompleteCep('5750')).toBe(false)
  })

  it('validates the CNPJ check digits', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
    expect(isValidCnpj('11.222.333/0001-80')).toBe(false)
    expect(isValidCnpj('00.000.000/0000-00')).toBe(false)
  })
})

describe('money input', () => {
  it('formats a value in reais', () => {
    expect(formatMoneyInput(1518)).toBe('R$ 1.518,00')
    expect(formatMoneyInput(39.9)).toBe('R$ 39,90')
    expect(formatMoneyInput(null)).toBe('')
  })

  it('enters digits from the right, like a cash register', () => {
    expect(parseMoneyInput('1')).toBe(0.01)
    expect(parseMoneyInput('R$ 1,51')).toBe(1.51)
    expect(parseMoneyInput('R$ 1.518,00')).toBe(1518)
    expect(parseMoneyInput('')).toBeNull()
    expect(parseMoneyInput('R$ ')).toBeNull()
  })

  it('caps absurd values', () => {
    expect(parseMoneyInput('99999999999999')).toBe(999999999.99)
  })
})

describe('titleCasePt', () => {
  it('capitalizes names and keeps the small words lower', () => {
    expect(titleCasePt('santana DO ipanema')).toBe('Santana do Ipanema')
    expect(titleCasePt("olho d'água das flores")).toBe("Olho d'Água das Flores")
    expect(titleCasePt('  são josé da tapera ')).toBe('São José da Tapera')
    expect(titleCasePt('senador rui palmeira')).toBe('Senador Rui Palmeira')
    expect(titleCasePt('')).toBe('')
  })
})
