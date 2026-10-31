import {describe,it,expect} from 'vitest'
import {registrationDestination,inferRegistrationRole,confirmationRedirect,isPrivatePath} from './authFlow'
import {safeInternalPath} from './utils'
describe('continuidade do cadastro',()=>{
 it('preserva a vaga ao passar pela conclusão do perfil',()=>{const vaga='/vagas/123?candidatar=1';const target=registrationDestination('candidato',vaga);expect(new URL(target,'https://site.test').searchParams.get('voltar')).toBe(vaga);const callback=new URL(confirmationRedirect(target,'https://site.test'));expect(callback.pathname).toBe('/auth/confirmar');expect(callback.searchParams.get('redirect')).toBe(target)})
 it('identifica o perfil de quem chegou pela publicação de vaga',()=>{expect(inferRegistrationRole('/empresa/vagas/nova')).toBe('empresa_owner');expect(inferRegistrationRole('/vagas/123?candidatar=1')).toBe('candidato')})
 it('leva empresa sem destino à conclusão e publicação de vaga',()=>{expect(new URL(registrationDestination('empresa_owner'),'https://site.test').searchParams.get('voltar')).toBe('/empresa/vagas/nova')})
 it('recusa destinos externos e escapes',()=>{for(const path of ['//evil.test','/\\evil.test','/%2fevil.test','/\n/evil.test','https://evil.test'])expect(safeInternalPath(path)).toBeNull();expect(registrationDestination('candidato','https://evil.test')).toBe('/candidato/onboarding')})
 it('distingue páginas públicas de painéis',()=>{expect(isPrivatePath('/empresas/123')).toBe(false);expect(isPrivatePath('/autonomos/123')).toBe(false);expect(isPrivatePath('/auth/confirmar')).toBe(true)})
})
