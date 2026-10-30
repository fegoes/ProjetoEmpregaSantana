import { describe, expect, it } from 'vitest'
import { editorialDateInput, editorialDateISO, editorialStatus } from './editorial'
describe('agenda editorial de Recife',()=>{
  it('converte data civil sem depender do fuso do computador',()=>{expect(editorialDateISO('2026-11-02T09:30')).toBe('2026-11-02T12:30:00.000Z');expect(editorialDateInput('2026-11-02T12:30:00.000Z')).toBe('2026-11-02T09:30')})
  it('trata data vazia e inválida',()=>{expect(editorialDateISO('')).toBeNull();expect(editorialDateInput('invalid')).toBe('')})
  it('distingue agenda de publicação sem expor rascunho',()=>{const now=Date.parse('2026-10-30T12:00:00Z');expect(editorialStatus({status:'published',published_at:'2026-11-02T12:30:00Z'},now)).toBe('Agendado');expect(editorialStatus({status:'published',published_at:'2026-10-01T12:30:00Z'},now)).toBe('Publicado');expect(editorialStatus({status:'draft',published_at:'2026-11-02T12:30:00Z'},now)).toBe('Rascunho')})
})
