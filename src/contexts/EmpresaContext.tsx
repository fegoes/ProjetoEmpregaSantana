import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

type Empresa = Database['public']['Tables']['empresas']['Row']
interface EmpresaContextValue {
  empresa: Empresa | null
  empresas: Empresa[]
  loading: boolean
  error: boolean
  selectEmpresa: (id: string) => void
  refresh: () => Promise<void>
}
const EmpresaContext = React.createContext<EmpresaContextValue | undefined>(undefined)

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [selection,setSelection] = React.useState<{userId:string;companyId:string}|null>(null)
  const query=useQuery({queryKey:['empresa-context',user?.id],enabled:Boolean(user),queryFn:async()=>{
    const {data:members,error}=await supabase.from('empresa_members').select('empresa_id').eq('user_id',user!.id)
    if(error)throw error
    if(!members.length)return []
    const result=await supabase.from('empresas').select('*').in('id',members.map(m=>m.empresa_id)).order('nome_fantasia')
    if(result.error)throw result.error
    return result.data
  }})
  const empresas=user?query.data??[]:[]
  const selected=selection?.userId===user?.id?selection?.companyId:null
  const empresa=empresas.find(e=>e.id===selected)??empresas[0]??null
  const refresh=async()=>{await query.refetch()}
  return <EmpresaContext.Provider value={{empresa,empresas,loading:Boolean(user)&&query.isLoading,error:query.isError,selectEmpresa:id=>{if(user&&empresas.some(e=>e.id===id))setSelection({userId:user.id,companyId:id})},refresh}}>{children}</EmpresaContext.Provider>
}
export function useEmpresa() {
  const context=React.useContext(EmpresaContext)
  if(!context)throw new Error('useEmpresa deve ser usado dentro de <EmpresaProvider>')
  return context
}
