import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { panelPathFor } from '@/lib/panelNav'
import type { UserRole } from '@/types/database'

interface ProtectedRouteProps {
  roles?: UserRole[]
  adminOnly?: boolean
}

function CheckingAccess() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Verificando acesso">
      <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary motion-reduce:animate-none" />
    </div>
  )
}

/**
 * Exige login e, opcionalmente, um perfil. Superadmin e dono de empresa são
 * perfis diferentes: ser superadmin NÃO dá acesso às áreas de empresa,
 * candidato ou autônomo (quem tem os dois perfis troca de painel no menu).
 */
export function ProtectedRoute({ roles, adminOnly = false }: ProtectedRouteProps) {
  const { user, roles: userRoles, isAdmin, loading, authError, refreshProfile, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <CheckingAccess />

  if (user && authError) return <div role="alert" className="space-y-4"><p>{authError}</p><button className="min-h-11 rounded border px-4" onClick={()=>void refreshProfile()}>Tentar novamente</button><button className="min-h-11 px-4" onClick={()=>void signOut()}>Sair</button></div>
  if (!user) {
    const destination = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(destination)}`} replace />
  }

  // Sem o perfil que a tela pede, a pessoa vai para o painel que ela tem (o superadmin, para o /admin).
  const ownPanel = panelPathFor({ isAdmin, roles: userRoles })

  if (adminOnly && !isAdmin) {
    return <Navigate to={ownPanel} replace />
  }

  if (roles && roles.length > 0 && !roles.some((r) => userRoles.includes(r))) {
    return <Navigate to={ownPanel} replace />
  }

  return <Outlet />
}
