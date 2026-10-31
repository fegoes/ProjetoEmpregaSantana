import {describe,it,expect,vi,beforeEach} from 'vitest'
import {confirmRegistration} from './confirmRegistration'
const auth=vi.hoisted(()=>({getSession:vi.fn(),verifyOtp:vi.fn(),exchangeCodeForSession:vi.fn()}))
vi.mock('./supabase',()=>({supabase:{auth}}))
beforeEach(()=>{vi.clearAllMocks();auth.getSession.mockResolvedValue({data:{session:null},error:null})})
describe('retorno da confirmação',()=>{
 it('usa a sessão já processada pelo cliente sem reconsumir token',async()=>{auth.getSession.mockResolvedValue({data:{session:{user:{id:'confirmed'}}},error:null});expect(await confirmRegistration('https://site.test/auth/confirmar')).toEqual({error:null});expect(auth.verifyOtp).not.toHaveBeenCalled()})
 it('aceita link com token_hash de cadastro',async()=>{auth.verifyOtp.mockResolvedValue({data:{session:{user:{id:'confirmed'}}},error:null});expect((await confirmRegistration('https://site.test/auth/confirmar?token_hash=token&type=signup')).error).toBeNull();expect(auth.verifyOtp).toHaveBeenCalledWith({token_hash:'token',type:'signup'})})
 it('não interpreta link de recuperação como confirmação de cadastro',async()=>{expect((await confirmRegistration('https://site.test/auth/confirmar?token_hash=t&type=recovery')).error).toBeTruthy();expect(auth.verifyOtp).not.toHaveBeenCalled()})
 it('não declara confirmado ao receber erro mesmo com sessão anterior',async()=>{expect((await confirmRegistration('https://site.test/auth/confirmar#error=access_denied&error_code=otp_expired')).error).toContain('expirou');expect(auth.getSession).not.toHaveBeenCalled()})
 it('sem sessão exige novo link ou login',async()=>{expect((await confirmRegistration('https://site.test/auth/confirmar')).error).toBeTruthy()})
})
