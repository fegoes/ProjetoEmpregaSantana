import * as React from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

type Empresa = Database['public']['Tables']['empresas']['Row']

interface EmpresaContextValue {
  empresa: Empresa | null
  loading: boolean
  refresh: () => Promise<void>
}

const EmpresaContext = React.createContext<EmpresaContextValue | undefined>(undefined)

// Contexto enxuto: v1 assume um usuário gerenciando UMA empresa (via empresa_members).
// Ver docs/PRD.md seção 3 — evoluir para seletor multi-empresa só quando o caso de uso surgir.
export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [empresa, setEmpresa] = React.useState<Empresa | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    if (!user) {
      setEmpresa(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data: membership } = await supabase
      .from('empresa_members')
      .select('empresa_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!membership) {
      setEmpresa(null)
      setLoading(false)
      return
    }

    const { data: empresaRow } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', membership.empresa_id)
      .single()

    setEmpresa(empresaRow ?? null)
    setLoading(false)
  }, [user])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <EmpresaContext.Provider value={{ empresa, loading, refresh }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export function useEmpresa() {
  const ctx = React.useContext(EmpresaContext)
  if (!ctx) throw new Error('useEmpresa deve ser usado dentro de <EmpresaProvider>')
  return ctx
}
