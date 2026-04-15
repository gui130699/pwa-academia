import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, isLoading, accessStatus } = useAuth()
  const location = useLocation()

  if (isLoading || accessStatus === 'loading') {
    return <LoadingScreen message="Carregando sua área segura..." />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (accessStatus === 'verify-email') {
    return <Navigate to="/verificar-email" replace />
  }

  if (accessStatus === 'pending-approval') {
    return <Navigate to="/aguardando-aprovacao" replace />
  }

  return <Outlet />
}
