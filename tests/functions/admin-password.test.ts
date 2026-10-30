import { describe,it,expect,vi } from 'vitest'
import { passwordHandler } from '../../supabase/functions/admin-password/handler'
const id='11111111-1111-4111-8111-111111111111'
const env={url:'https://unit.test',anonKey:'public-test',serviceKey:'server-only-test'}
function fixture(options:{admin?:boolean;active?:boolean;rate?:boolean;changed?:boolean;mfa?:boolean;expired?:boolean;auditFailure?:boolean}={}){
 const request=vi.fn(async(url:string,init?:RequestInit)=>{
  if(url.endsWith('/auth/v1/user'))return options.expired?Response.json({},{status:401}):Response.json({id,factors:options.mfa?[{status:'verified'}]:[]})
  if(url.includes('/profiles?'))return Response.json([{id,is_admin:options.admin??true,is_active:options.active??true}])
  if(url.includes('/rpc/'))return options.rate?Response.json({code:'P0001'},{status:400}):Response.json(id)
  if(init?.method==='PUT')return Response.json({}, {status:options.changed===false?400:200})
  if(options.auditFailure)throw new Error('audit network failure')
  return new Response(null,{status:204})
 })
 const run=(password='unit-test-password',authorization='Bearer authenticated-token')=>passwordHandler(env,request as typeof fetch)(new Request('https://edge.test',{method:'POST',headers:{Authorization:authorization},body:JSON.stringify({userId:id,password})}))
 return {request,run}
}
describe('definição administrativa de senha',()=>{
 it('recusa ausência de sessão antes de chamar serviços',async()=>{const f=fixture();expect((await f.run('unit-test-password','')).status).toBe(401);expect(f.request).not.toHaveBeenCalled()})
 it('recusa conta comum sem usar chave privilegiada',async()=>{const f=fixture({admin:false});expect((await f.run()).status).toBe(403);expect(f.request.mock.calls.some(([,r])=>r?.method==='PUT')).toBe(false)})
 it('recusa administrador desativado',async()=>{const f=fixture({active:false});expect((await f.run()).status).toBe(403)})
 it('valida tamanho de senha no servidor',async()=>{const f=fixture();expect((await f.run('curta')).status).toBe(400);expect(f.request).not.toHaveBeenCalled()})
 it('limita tentativas antes da mudança de senha',async()=>{const f=fixture({rate:true});expect((await f.run()).status).toBe(429);expect(f.request.mock.calls.some(([,r])=>r?.method==='PUT')).toBe(false)})
 it('usa credencial somente no servidor e registra resultado sem senha',async()=>{const f=fixture();const result=await f.run();expect(result.status).toBe(200);expect(await result.text()).not.toContain('unit-test-password');const change=f.request.mock.calls.find(([,r])=>r?.method==='PUT');expect(change?.[1]?.headers).toMatchObject({Authorization:'Bearer server-only-test'});const log=f.request.mock.calls.find(([,r])=>r?.method==='PATCH');expect(JSON.parse(log?.[1]?.body as string)).toEqual({result:'success'})})
 it('recusa token expirado sem operação administrativa',async()=>{const f=fixture({expired:true});expect((await f.run()).status).toBe(401);expect(f.request.mock.calls.some(([,r])=>r?.method==='PUT')).toBe(false)})
 it('exige segundo fator quando a conta tem MFA verificado',async()=>{const f=fixture({mfa:true});const jwt='Bearer e30.'+btoa(JSON.stringify({aal:'aal1'}))+'.signature';expect((await f.run('unit-test-password',jwt)).status).toBe(403);expect(f.request.mock.calls.some(([,r])=>r?.method==='PUT')).toBe(false)})
 it('não confunde senha confirmada com falha de transporte da auditoria',async()=>{const f=fixture({auditFailure:true});const result=await f.run();expect(result.status).toBe(200);expect(await result.json()).toEqual({ok:true,auditPending:true})})
 it('registra falha sem expor resposta do provedor',async()=>{const f=fixture({changed:false});expect((await f.run()).status).toBe(400);expect(f.request.mock.calls.find(([,r])=>r?.method==='PATCH')?.[1]?.body).toBe('{"result":"failed"}')})
})
