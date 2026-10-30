import { describe, expect, it, vi } from 'vitest'
import { usersHandler } from '../../supabase/functions/admin-users/handler'
const caller='00000000-0000-4000-8000-000000000001'
const target='00000000-0000-4000-8000-000000000002'
function fixture(options:{admin?:boolean;active?:boolean;expired?:boolean;saveFailure?:boolean;cleanupFailure?:boolean;duplicate?:boolean;targetAdmin?:boolean;mfa?:boolean;emailFailure?:boolean}={}) {
  const fetcher=vi.fn(async(url:string,init?:RequestInit)=>{
    if(url.endsWith('/auth/v1/user'))return Response.json({id:caller,factors:options.mfa?[{status:'verified'}]:[]},{status:options.expired?401:200})
    if(url.includes('/rest/v1/profiles?id=eq.'+caller))return Response.json([{id:caller,is_admin:options.admin??true,is_active:options.active??true}])
    if(url.includes('/rest/v1/profiles?id=eq.'+target))return Response.json([{id:target,is_admin:options.targetAdmin??false}])
    if(url.endsWith('/auth/v1/admin/users')&&init?.method==='POST')return Response.json({id:target},{status:options.duplicate?422:200})
    if(url.includes('/rpc/admin_save_person'))return Response.json(options.saveFailure?{error:'internal detail'}:target,{status:options.saveFailure?400:200})
    if(url.endsWith('/auth/v1/admin/users/'+target))return Response.json({},{status:init?.method==='DELETE'?(options.cleanupFailure?500:200):(options.emailFailure?422:200)})
    throw new Error('Unexpected request '+url)
  })
  const handler=usersHandler({url:'https://example.test',anonKey:'anon-test',serviceKey:'service-test'},fetcher as unknown as typeof fetch)
  const input={action:'create',email:'person@example.test',full_name:'Pessoa Teste',password:'long-test-password',roles:['candidato'],city:'Santana do Ipanema',state:'AL'}
  const run=(body:unknown=input,token='Bearer valid-test')=>handler(new Request('https://function.test',{method:'POST',headers:{Authorization:token,'Content-Type':'application/json'},body:JSON.stringify(body)}))
  return {fetcher,input,run,handler}
}
describe('admin-users',()=>{
  it('cria conta real com credencial privilegiada só após conferir a sessão',async()=>{const f=fixture();const r=await f.run();expect(r.status).toBe(200);expect(await r.json()).toEqual({ok:true,userId:target});const calls=f.fetcher.mock.calls;expect(calls.findIndex(([url])=>url.endsWith('/auth/v1/user'))).toBeLessThan(calls.findIndex(([url])=>url.endsWith('/auth/v1/admin/users')));const body=JSON.parse(String(calls.find(([url])=>url.endsWith('/rpc/admin_save_person'))?.[1]?.body));expect(body.p_roles).toEqual(['candidato']);expect(JSON.stringify(body)).not.toContain('password')})
  for(const options of [{admin:false},{active:false},{expired:true}])it('bloqueia conta sem autorização '+JSON.stringify(options),async()=>{const f=fixture(options);expect((await f.run()).status).toBe(options.expired?401:403);expect(f.fetcher.mock.calls.some(([url])=>url.includes('/auth/v1/admin/'))).toBe(false)})
  it('recusa perfil administrativo no cadastro',async()=>{const f=fixture();expect((await f.run({...f.input,roles:['admin']})).status).toBe(400);expect(f.fetcher).not.toHaveBeenCalled()})
  it('recusa senha curta e identificador inválido',async()=>{const f=fixture();expect((await f.run({...f.input,password:'short'})).status).toBe(400);expect((await f.run({action:'delete',userId:'not-an-id'})).status).toBe(400);expect(f.fetcher).not.toHaveBeenCalled()})
  it('remove a conta recém-criada se o perfil falhar',async()=>{const f=fixture({saveFailure:true});expect((await f.run()).status).toBe(400);expect(f.fetcher.mock.calls.some(([url,r])=>url.endsWith('/auth/v1/admin/users/'+target)&&r?.method==='DELETE')).toBe(true)})
  it('informa conta incompleta quando a compensação falha',async()=>{const f=fixture({saveFailure:true,cleanupFailure:true});const r=await f.run();expect(r.status).toBe(409);expect((await r.json()).error).toContain('não repita a criação')})
  it('não tenta gravar perfil quando o e-mail já existe',async()=>{const f=fixture({duplicate:true});expect((await f.run()).status).toBe(409);expect(f.fetcher.mock.calls.some(([url])=>url.includes('/rpc/'))).toBe(false)})
  it('exclui a conta de autenticação e protege administradores',async()=>{const f=fixture();expect((await f.run({action:'delete',userId:target})).status).toBe(200);const blocked=fixture({targetAdmin:true});expect((await blocked.run({action:'delete',userId:target})).status).toBe(409);expect(blocked.fetcher.mock.calls.some(([,r])=>r?.method==='DELETE')).toBe(false)})
  it('impede exclusão e desativação da própria conta',async()=>{const f=fixture();expect((await f.run({action:'delete',userId:caller})).status).toBe(409);expect((await f.run({...f.input,action:'update',userId:caller,is_active:false})).status).toBe(409)})
  it('exige segundo fator quando configurado',async()=>{const f=fixture({mfa:true});const token='Bearer e30.'+btoa(JSON.stringify({aal:'aal1'}))+'.signature';expect((await f.run(undefined,token)).status).toBe(403);expect(f.fetcher.mock.calls.some(([url])=>url.includes('/auth/v1/admin/'))).toBe(false)})
  it('explica atualização parcial quando o Auth rejeita e-mail',async()=>{const f=fixture({emailFailure:true});const r=await f.run({...f.input,action:'update',userId:target});expect(r.status).toBe(409);expect((await r.json()).error).toContain('perfil foi salvo')})
  it('aceita preflight sem consultar credenciais',async()=>{const f=fixture();expect((await f.handler(new Request('https://function.test',{method:'OPTIONS'}))).status).toBe(204);expect(f.fetcher).not.toHaveBeenCalled()})
})
