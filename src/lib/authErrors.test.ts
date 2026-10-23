import { describe, expect, it } from 'vitest'
import { translateAuthError } from './authErrors'

describe('translateAuthError', () => {
  it('translates the common Supabase Auth messages', () => {
    expect(translateAuthError('Invalid login credentials')).toBe('E-mail ou senha incorretos. Confira e tente de novo.')
    expect(translateAuthError('User already registered')).toMatch(/Já existe uma conta/)
    expect(translateAuthError('Password should be at least 6 characters.')).toBe(
      'A senha precisa ter pelo menos 6 caracteres.',
    )
    expect(translateAuthError('Email rate limit exceeded')).toMatch(/Muitas tentativas/)
    expect(translateAuthError('Failed to fetch')).toMatch(/Sem conexão/)
  })

  it('never leaks unknown English messages', () => {
    expect(translateAuthError('Something odd happened')).toBe('Não foi possível concluir agora. Tente de novo em instantes.')
  })

  it('passes through empty values', () => {
    expect(translateAuthError(null)).toBeNull()
  })
})
