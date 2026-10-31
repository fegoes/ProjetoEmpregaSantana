import type { UserRole } from '@/types/database'
import { safeInternalPath } from './utils'

export function inferRegistrationRole(requested?:string|null):UserRole {
  const next=safeInternalPath(requested)
  return next?.startsWith('/empresa/')?'empresa_owner':next?.startsWith('/autonomo/')?'autonomo':'candidato'
}
export function registrationDestination(role: UserRole, requested?: string | null): string {
  const next=safeInternalPath(requested)
  const onboarding=role==='empresa_owner'?'/empresa/onboarding':role==='autonomo'?'/autonomo/onboarding':'/candidato/onboarding'
  if(next?.startsWith(onboarding))return next
  const target=next??(role==='empresa_owner'?'/empresa/vagas/nova':null)
  return target?`${onboarding}?voltar=${encodeURIComponent(target)}`:onboarding
}
export function confirmationRedirect(redirect: string | null | undefined, origin=window.location.origin): string {
  const url=new URL('/auth/confirmar',origin)
  const next=safeInternalPath(redirect)
  if(next)url.searchParams.set('redirect',next)
  return url.href
}
export function isPrivatePath(path: string): boolean {
  return /^\/(admin|perfil|candidato|autonomo|empresa|login|cadastro|auth|redefinir-senha|esqueci-senha)(\/|$)/.test(path)
}
