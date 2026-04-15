import { Navigate, Outlet } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../hooks/useAuth'

export function GuestRoute() {
  const { user, profile, isLoading, accessStatus } = useAuth()

  if (isLoading || accessStatus === 'loading') {
    return <LoadingScreen message="Preparando o acesso..." />
  }

  if (user && accessStatus === 'approved') {
    return (
      <Navigate
        to={profile?.tipoConta === 'professor' ? '/professor/dashboard' : '/aluno/dashboard'}
        replace
      />
    )
  }

  if (user && accessStatus === 'verify-email') {
    return <Navigate to="/verificar-email" replace />
  }

  if (user && accessStatus === 'pending-approval') {
    return <Navigate to="/aguardando-aprovacao" replace />
  }

  return <Outlet />
}
