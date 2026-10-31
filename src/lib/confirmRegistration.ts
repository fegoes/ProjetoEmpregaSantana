import { supabase } from './supabase'

export async function confirmRegistration(href: string) {
  const url=new URL(href)
  const hash=new URLSearchParams(url.hash.slice(1))
  const error=url.searchParams.get('error')||hash.get('error')||url.searchParams.get('error_code')||hash.get('error_code')
  if(error) return {error:'O link de confirmação expirou ou já foi utilizado. Peça um novo link ou tente entrar com sua senha.'}
  try {
    const token=url.searchParams.get('token_hash')
    if(token){
      const type=url.searchParams.get('type')
      if(type!=='signup'&&type!=='email')return {error:'Este link não é de confirmação de cadastro.'}
      const result=await supabase.auth.verifyOtp({token_hash:token,type})
      if(result.error||!result.data.session)return {error:'Não foi possível confirmar este link. Peça uma nova mensagem ou tente entrar.'}
      return {error:null}
    }
    // O cliente processa o retorno implícito durante sua inicialização.
    // getSession aguarda essa inicialização; não reconsome o mesmo link.
    const {data,error:sessionError}=await supabase.auth.getSession()
    if(!sessionError&&data.session)return {error:null}
    const code=url.searchParams.get('code')
    if(code){const result=await supabase.auth.exchangeCodeForSession(code);if(!result.error&&result.data.session)return {error:null}}
    return {error:'Não encontramos uma confirmação válida nesta página. Abra o link recebido no e-mail ou entre com sua senha se já confirmou a conta.'}
  } catch {return {error:'Não foi possível verificar o link. Confira a conexão e tente novamente.'}}
}
