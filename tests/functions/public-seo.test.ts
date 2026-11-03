import {afterEach,describe,expect,it,vi} from 'vitest'
import middleware from '../../middleware'
const id='00000000-0000-4000-8000-000000000001'
const job={title:'Assistente administrativo',description_html:'<p>Atendimento e organização.</p>',status:'published',expires_at:'2099-01-01T00:00:00Z',employment_type:'clt',created_at:'2026-10-01T00:00:00Z',is_remote:false,location_city:'Santana do Ipanema',location_state:'AL',pricing_model:'fixed_salary',salary_visible:false,salary_min:2500,salary_max:3000,empresas:{nome_fantasia:'Empresa local',logo_url:null}}
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs()})
function setup(data:unknown=job){vi.stubEnv('VITE_SUPABASE_URL','https://database.test');vi.stubEnv('VITE_SUPABASE_ANON_KEY','anon-test');vi.stubGlobal('fetch',vi.fn(async()=>Response.json([data])))}
describe('páginas públicas para indexação',()=>{
 for(const agent of ['Googlebot','bingbot','Google-InspectionTool'])it(`entrega vaga sem login ou JavaScript a ${agent}`,async()=>{setup();const r=await middleware(new Request(`https://site.test/vagas/${id}`,{headers:{'user-agent':agent}}));const html=await r.text();expect(r.status).toBe(200);expect(html).toContain('Atendimento e organização.');expect(html).toContain('JobPosting');expect(html).toContain('FULL_TIME');expect(html).not.toContain('baseSalary');expect(html).toContain('rel="canonical"');expect(html).toContain('index, follow')})
 it('vaga expirada não anuncia contratação aberta',async()=>{setup({...job,expires_at:'2020-01-01T00:00:00Z'});const r=await middleware(new Request(`https://site.test/vagas/${id}`,{headers:{'user-agent':'Googlebot'}}));expect(r.status).toBe(404);expect(r.headers.get('x-robots-tag')).toBe('noindex');expect(await r.text()).not.toContain('JobPosting')})
 it('falha de banco não é confundida com vaga excluída',async()=>{setup();vi.stubGlobal('fetch',vi.fn(async()=>new Response('unavailable',{status:500})));expect((await middleware(new Request(`https://site.test/vagas/${id}`,{headers:{'user-agent':'Googlebot'}}))).status).toBe(503)})
 it('sitemap usa XML, URLs reais e filtros de publicação/expiração',async()=>{setup();const fetcher=vi.fn(async(input:string)=>Response.json(input.includes('/vagas?')?[{id,updated_at:'2026-10-01'}]:[]));vi.stubGlobal('fetch',fetcher);const r=await middleware(new Request('https://site.test/sitemap.xml'));expect(r.headers.get('content-type')).toContain('application/xml');expect(await r.text()).toContain(`https://site.test/vagas/${id}`);expect(fetcher.mock.calls.find(([url])=>url.includes('/vagas?'))?.[0]).toContain('expires_at.gt.');expect(fetcher.mock.calls.find(([url])=>url.includes('/artigos?'))?.[0]).toContain('noindex=eq.false')})
 it('não retorna sitemap vazio como sucesso se o banco falhar',async()=>{setup();vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:500})));expect((await middleware(new Request('https://site.test/sitemap.xml'))).status).toBe(503)})
 it('mantém callback, login e painéis fora da indexação',async()=>{for(const path of ['/auth/confirmar','/esqueci-senha','/admin/usuarios','/empresa/vagas']){const r=await middleware(new Request('https://site.test'+path));expect(r.headers.get('x-robots-tag')).toContain('noindex')}})
})

describe('conteúdo publicado no editor de páginas',()=>{
 it('inclui o texto de seções salvas na resposta para buscadores',async()=>{
  setup()
  const {starterLayout}=await import('../../src/lib/pageLayout')
  const layout=starterLayout('Página criada pela equipe')
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json([{title:'Página publicada',content_html:'',layout,seo_description:'Descrição publicada'}])))
  const r=await middleware(new Request('https://site.test/pagina/pagina-publicada',{headers:{'user-agent':'Googlebot'}}))
  expect(r.status).toBe(200);expect(await r.text()).toContain('Página criada pela equipe')
 })
})

it('a inicial vazia salva não restaura o modelo antigo para buscadores', async () => {
 setup({ title: 'Inicial atual', content_html: 'Texto legado oculto', layout: { version: 1, sections: [] } })
 const response = await middleware(new Request('https://site.test/', { headers: { 'user-agent': 'Googlebot' } }))
 const html = await response.text()
 expect(html).toContain('Inicial atual')
 expect(html).not.toContain('Texto legado oculto')
 expect(html).not.toContain('Seu próximo passo começa perto de casa')
 expect(response.headers.get('cache-control')).toBe('no-store')
})
it('a inicial textual salva também é respeitada por buscadores', async () => {
 setup({ title: 'Inicial atual', content_html: '<p>Conteúdo atual do banco</p>', layout: null })
 const response = await middleware(new Request('https://site.test/', { headers: { 'user-agent': 'Googlebot' } }))
 const html = await response.text()
 expect(html).toContain('Conteúdo atual do banco')
 expect(html).not.toContain('Seu próximo passo começa perto de casa')
})
