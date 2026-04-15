import { Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'

export function PendingApprovalPage() {
  const navigate = useNavigate()
  const { user, profile, accessStatus, refreshProfile, signOutUser } = useAuth()
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    if (accessStatus === 'approved') {
      navigate('/dashboard', { replace: true })
    }

    if (accessStatus === 'verify-email') {
      navigate('/verificar-email', { replace: true })
    }
  }, [accessStatus, navigate, user])

  async function handleRefresh() {
    setError('')
    setIsRefreshing(true)

    try {
      await refreshProfile()
    } catch (currentError) {
      setError(getFirebaseErrorMessage(currentError, 'Não foi possível atualizar a aprovação agora.'))
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleLogout() {
    await signOutUser()
    navigate('/login', { replace: true })
  }

  return (
    <main className="screen-section compact-screen">
      <section className="simple-card center-card">
        <div className="icon-badge pending">
          <Clock3 size={24} />
        </div>
        <span className="eyebrow">Aguardando aprovação</span>
        <h1>Seu cadastro foi recebido</h1>
        <p>
          {profile?.tipoConta === 'professor'
            ? 'Estamos analisando seus dados e a credencial profissional antes de liberar o acesso.'
            : 'Estamos revisando o seu cadastro antes de liberar o acesso à plataforma.'}
        </p>

        <ul className="status-list">
          <li><strong>Nome:</strong> {profile?.nomeCompleto}</li>
          <li><strong>E-mail:</strong> {user?.email}</li>
          <li><strong>Status:</strong> {profile?.statusAprovacao ?? 'pendente'}</li>
        </ul>

        {error ? <div className="info-banner error-banner">{error}</div> : null}

        <div className="button-stack">
          <button className="btn btn-primary" type="button" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Atualizando...' : 'Verificar aprovação'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </section>
    </main>
  )
}
