import { describe, it, expect } from 'vitest'
import { taxonomyOptions, taxonomySlug } from './taxonomies'
import { validateAdminRecord, toLocalDateTime } from './adminForms'
describe('classificações dos cadastros', () => {
  it('gera identificador estável a partir de nomes com acentos', () => {
    expect(taxonomySlug('  Saúde & manutenção! ')).toBe('saude-manutencao')
  })
  it('isola empresas das categorias compartilhadas e conserva selecionados inativos', () => {
    const rows = [ {slug:'all',label:'Compartilhada',kind:'both',is_active:true}, {slug:'old',label:'Antiga',kind:'vaga',is_active:false}, {slug:'business',label:'Empresa',kind:'empresa',is_active:true} ]
    expect(taxonomyOptions(rows,'empresa').map(x=>x.slug)).toEqual(['business'])
    expect(taxonomyOptions(rows,'vaga').map(x=>x.slug)).toEqual(['all'])
    expect(taxonomyOptions(rows,'vaga','old').map(x=>x.slug)).toEqual(['all','old'])
  })
  it('exige conteúdo real para publicar, sem bloquear o rascunho', () => {
    expect(validateAdminRecord('vagas',{status:'published',description_html:'<p>&nbsp;</p>'})).toContain('Descreva')
    expect(validateAdminRecord('vagas',{status:'draft',description_html:''})).toBe('')
  })
  it('preserva o instante ao editar o prazo no horário local', () => {
    const original = '2026-11-10T18:30:00.000Z'
    expect(new Date(toLocalDateTime(original)).toISOString()).toBe(original)
    expect(toLocalDateTime(null)).toBe('')
    expect(validateAdminRecord('empresas',{website:'javascript:alert(1)'})).toContain('site completo')
  })
})
