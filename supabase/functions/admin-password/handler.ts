type Environment = { url: string; anonKey: string; serviceKey: string }
export function passwordHandler(env:Environment, requestFetch:typeof fetch=fetch) {
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store'}
 return async(request:Request):Promise<Response>=>{
  const reply=(status:number,error?:string)=>Response.json(error?{error}:{ok:true},{status,headers:cors})
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors})
  if(request.method!=='POST')return reply(405,'Método não permitido.')
  if(!env.url||!env.anonKey||!env.serviceKey)return reply(503,'Serviço indisponível.')
  const authorization=request.headers.get('authorization')??''
  if(!/^Bearer \S+$/.test(authorization))return reply(401,'Entre novamente.')
  if(Number(request.headers.get('content-length')??0)>4096)return reply(413,'Solicitação inválida.')
  try{
   const text=await request.text();if(text.length>4096)return reply(413,'Solicitação inválida.')
   let input:{userId?:string;password?:string};try{input=JSON.parse(text)}catch{return reply(400,'Solicitação inválida.')}
   if(typeof input.userId!=='string'||!(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.userId))||typeof input.password!=='string'||input.password.length<12||input.password.length>128)return reply(400,'Use uma senha entre 12 e 128 caracteres e um usuário válido.')
   const userHeaders={apikey:env.anonKey,Authorization:authorization,'Content-Type':'application/json'}
   const auth=await requestFetch(`${env.url}/auth/v1/user`,{headers:userHeaders})
   if(!auth.ok)return reply(401,'Sessão inválida ou expirada.')
   const caller=await auth.json()
   const profile=await requestFetch(`${env.url}/rest/v1/profiles?id=eq.${encodeURIComponent(caller.id)}&select=id,is_admin,is_active`,{headers:userHeaders})
   if(!profile.ok)return reply(403,'Acesso negado.')
   const rows=await profile.json()
   if(rows.length!==1||rows[0].id!==caller.id||rows[0].is_admin!==true||rows[0].is_active!==true)return reply(403,'Acesso reservado à administração.')
   if(caller.factors?.some((f:{status:string})=>f.status==='verified')){
    const payload=JSON.parse(atob(authorization.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
    if(payload.aal!=='aal2')return reply(403,'Confirme a autenticação em dois fatores antes de continuar.')
   }
   const reservation=await requestFetch(`${env.url}/rest/v1/rpc/reserve_password_change`,{method:'POST',headers:userHeaders,body:JSON.stringify({target_user:input.userId})})
   if(!reservation.ok){const data=await reservation.json();return reply(data.code==='P0001'?429:403,data.code==='P0001'?'Limite atingido. Aguarde dez minutos antes de tentar novamente.':'Não foi possível autorizar a alteração.')}
   const eventId=await reservation.json()
   const serviceHeaders={apikey:env.serviceKey,Authorization:`Bearer ${env.serviceKey}`,'Content-Type':'application/json'}
   const changed=await requestFetch(`${env.url}/auth/v1/admin/users/${input.userId}`,{method:'PUT',headers:serviceHeaders,body:JSON.stringify({password:input.password})})
   // A reserved event remains pending if final audit confirmation fails.
   // Never report a confirmed password update as failed solely due to audit transport.
   const audit=await requestFetch(`${env.url}/rest/v1/admin_password_events?id=eq.${encodeURIComponent(eventId)}`,{method:'PATCH',headers:serviceHeaders,body:JSON.stringify({result:changed.ok?'success':'failed'})}).catch(()=>null)
   if(!changed.ok)return reply(400,'Não foi possível definir a senha. Confira o usuário e a política de senhas do sistema.')
   return Response.json({ok:true,auditPending:!audit?.ok},{status:200,headers:cors})
  }catch{return reply(500,'Não foi possível concluir a alteração. Tente novamente.')}
 }
}
