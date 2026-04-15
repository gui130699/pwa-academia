import { MailCheck, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const { user, accessStatus, resendVerification, refreshProfile, signOutUser } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    if (accessStatus === 'approved') {
      navigate('/aluno/dashboard', { replace: true })
    }

    if (accessStatus === 'pending-approval') {
      navigate('/aguardando-aprovacao', { replace: true })
    }
  }, [accessStatus, navigate, user])

  async function handleResend() {
    setError('')
    setMessage('')

    try {
      await resendVerification()
      setMessage('Novo e-mail de verificação enviado com sucesso.')
    } catch (currentError) {
      setError(getFirebaseErrorMessage(currentError, 'Não foi possível reenviar o e-mail agora.'))
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    setError('')
    setMessage('')

    try {
      await refreshProfile()
      setMessage('Status atualizado. Se o e-mail já foi confirmado, você avançará automaticamente.')
    } catch (currentError) {
      setError(getFirebaseErrorMessage(currentError, 'Não foi possível atualizar o status agora.'))
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
        <div className="icon-badge">
          <MailCheck size={24} />
        </div>
        <span className="eyebrow">Confirmação de e-mail</span>
        <h1>Verifique sua caixa de entrada</h1>
        <p>
          Enviamos um link de confirmação para <strong>{user?.email}</strong>. Depois de confirmar,
          clique em atualizar status.
        </p>

        {message ? <div className="info-banner success-banner">{message}</div> : null}
        {error ? <div className="info-banner error-banner">{error}</div> : null}

        <div className="button-stack">
          <button className="btn btn-primary" type="button" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw size={16} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar status'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleResend}>
            Reenviar e-mail
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>

        <p className="muted-text">
          Se precisar, volte para o <Link to="/login">login</Link> depois de confirmar o endereço.
        </p>
      </section>
    </main>
  )
}
