import { describe, expect, it } from 'vitest'
import {
  formatAutonomoPay,
  formatBRL,
  formatLocal,
  formatVagaPay,
  isVagaNova,
  plural,
  timeAgo,
  toWhatsAppNumber,
} from './format'

describe('formatBRL', () => {
  it('omits cents for whole values and keeps them otherwise', () => {
    expect(formatBRL(1518)).toBe('R$ 1.518')
    expect(formatBRL(99)).toBe('R$ 99')
    expect(formatBRL(39.9)).toBe('R$ 39,90')
  })
})

describe('formatVagaPay', () => {
  it('formats a monthly range', () => {
    expect(formatVagaPay({ pricing_model: 'fixed_salary', salary_min: 2100, salary_max: 2600 })).toBe(
      'R$ 2.100 a R$ 2.600/mês',
    )
  })

  it('formats a single monthly value and hourly rates', () => {
    expect(formatVagaPay({ pricing_model: 'fixed_salary', salary_min: 1518 })).toBe('R$ 1.518/mês')
    expect(formatVagaPay({ pricing_model: 'hourly', hourly_rate: 35 })).toBe('R$ 35/hora')
  })

  it('falls back when the salary is hidden or missing', () => {
    expect(formatVagaPay({ pricing_model: 'fixed_salary', salary_min: 1518, salary_visible: false })).toBe(
      'Salário a combinar',
    )
    expect(formatVagaPay({ pricing_model: 'fixed_salary' })).toBe('Salário a combinar')
    expect(formatVagaPay({ pricing_model: 'per_delivery' })).toBe('Pago por entrega')
  })
})

describe('formatAutonomoPay', () => {
  it('prefers the hourly rate, then the free-text note', () => {
    expect(formatAutonomoPay({ pricing_model: 'both', hourly_rate: 60 })).toBe('A partir de R$ 60/hora')
    expect(formatAutonomoPay({ pricing_model: 'per_delivery', delivery_rate_note: 'R$ 150 por diária' })).toBe(
      'R$ 150 por diária',
    )
    expect(formatAutonomoPay({ pricing_model: 'per_delivery' })).toBe('Orçamento a combinar')
  })
})

describe('formatLocal', () => {
  it('joins city and state with a comma', () => {
    expect(formatLocal('Santana do Ipanema', 'AL')).toBe('Santana do Ipanema, AL')
    expect(formatLocal(null, null)).toBe('Local a combinar')
  })
})

describe('timeAgo', () => {
  const now = new Date(2026, 9, 20, 15, 0)

  it('speaks in calendar days', () => {
    expect(timeAgo(new Date(2026, 9, 20, 8, 0).toISOString(), now)).toBe('hoje')
    expect(timeAgo(new Date(2026, 9, 19, 23, 0).toISOString(), now)).toBe('ontem')
    expect(timeAgo(new Date(2026, 9, 17).toISOString(), now)).toBe('há 3 dias')
    expect(timeAgo(new Date(2026, 9, 6).toISOString(), now)).toBe('há 2 semanas')
    expect(timeAgo(new Date(2026, 6, 1).toISOString(), now)).toBe('há 3 meses')
  })

  it('returns an empty string for missing dates', () => {
    expect(timeAgo(null, now)).toBe('')
  })
})

describe('isVagaNova', () => {
  const now = new Date(2026, 9, 20, 15, 0)

  it('marks vagas up to three days old', () => {
    expect(isVagaNova(new Date(2026, 9, 17).toISOString(), now)).toBe(true)
    expect(isVagaNova(new Date(2026, 9, 16).toISOString(), now)).toBe(false)
  })
})

describe('plural', () => {
  it('picks the singular for one', () => {
    expect(plural(1, 'vaga ativa', 'vagas ativas')).toBe('1 vaga ativa')
    expect(plural(10, 'vaga ativa', 'vagas ativas')).toBe('10 vagas ativas')
  })
})

describe('toWhatsAppNumber', () => {
  it('adds the country code to local numbers', () => {
    expect(toWhatsAppNumber('(82) 99999-0000')).toBe('5582999990000')
    expect(toWhatsAppNumber('5582999990000')).toBe('5582999990000')
    expect(toWhatsAppNumber('123')).toBeNull()
  })
})
