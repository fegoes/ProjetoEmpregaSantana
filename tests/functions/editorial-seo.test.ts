import {afterEach,describe,it,expect,vi} from 'vitest'
import middleware from '../../middleware'
import {editorialDrafts} from '../../src/content/editorialDrafts'
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()})
describe('metadados editoriais para robôs',()=>{
 it('mantém os três posts como rascunho com conteúdo e SEO',()=>{expect(editorialDrafts).toHaveLength(3);for(const d of editorialDrafts){expect(d.status).toBe('draft');expect(d.content_html?.length).toBeGreaterThan(1000);expect(d.seo_title).toBeTruthy()}})
 it('serve texto social, título SEO, canonical e noindex sem JavaScript',async()=>{
  vi.stubEnv('VITE_SUPABASE_URL','https://unit.test');vi.stubEnv('VITE_SUPABASE_ANON_KEY','unit-public')
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json([{slug:'teste',title:'Título do artigo',excerpt:'Resumo',content_html:'<p>Conteúdo</p>',author_name:'Equipe',published_at:'2026-10-22',updated_at:'2026-10-22',seo_title:'Título de busca',seo_description:'Descrição de busca',social_title:'Título social',social_description:'Descrição social',social_image_url:'https://img.test/share.jpg',social_image_alt:'Pessoas',canonical_url:'https://site.test/blog/teste',noindex:true,keywords:['carreira']}])) )
  const result=await middleware(new Request('https://site.test/blog/teste',{headers:{'user-agent':'Twitterbot'}}));const html=await result.text()
  expect(html).toContain('<title>Título de busca | EmpregaSantana</title>');expect(html).toContain('content="Título social"');expect(html).toContain('content="Descrição social"');expect(html).toContain('noindex, follow');expect(html).toContain('https://img.test/share.jpg');expect(html).toContain('rel="canonical" href="https://site.test/blog/teste"')
 })
})
