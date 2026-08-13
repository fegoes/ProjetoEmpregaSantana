import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'

interface ProtectedRouteProps {
  roles?: UserRole[]
  adminOnly?: boolean
}

export function ProtectedRoute({ roles, adminOnly = false }: ProtectedRouteProps) {
  const { user, roles: userRoles, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/perfil" replace />
  }

  if (roles && roles.length > 0 && !isAdmin && !roles.some((r) => userRoles.includes(r))) {
    return <Navigate to="/perfil" replace />
  }

  return <Outlet />
}
