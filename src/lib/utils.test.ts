import { describe, expect, it } from 'vitest'
import { cn } from './utils'

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
