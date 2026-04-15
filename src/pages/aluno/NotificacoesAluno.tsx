import { Check, Link2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getStudentNotifications, respondToLinkRequest } from '../../services/linkRequestService'
import type { VinculoNotificacao, VinculoStatus } from '../../types/notification'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function NotificacoesAluno() {
  const { user, profile, refreshProfile } = useAuth()
  const [notifications, setNotifications] = useState<VinculoNotificacao[]>([])
  const [feedback, setFeedback] = useState('')
  const [processingId, setProcessingId] = useState('')

  async function loadNotifications() {
    if (!user) {
      return
    }

    try {
      const result = await getStudentNotifications(user.uid)
      setNotifications(result)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar as notificações.'))
    }
  }

  useEffect(() => {
    void loadNotifications()
  }, [user])

  async function handleResponse(notification: VinculoNotificacao, status: VinculoStatus) {
    setProcessingId(notification.id)
    setFeedback('')

    try {
      await respondToLinkRequest({
        notificationId: notification.id,
        status,
        studentId: notification.alunoId,
        professorId: notification.professorId,
        professorNome: notification.professorNome,
      })

      await loadNotifications()
      await refreshProfile()
      setFeedback(status === 'aceito' ? 'Vínculo aceito com sucesso.' : 'Vínculo recusado com sucesso.')
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível responder à solicitação.'))
    } finally {
      setProcessingId('')
    }
  }

  return (
    <section className="aluno-page fade-in-panel">
      <span className="eyebrow">Notificações</span>
      <h2>Solicitações recebidas</h2>
      <p>
        {profile?.tipoConta === 'aluno' && profile.professorVinculadoNome
          ? `Você está vinculado ao professor ${profile.professorVinculadoNome}.`
          : 'Aqui você pode aceitar ou recusar solicitações de vínculo enviadas por professores.'}
      </p>

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      <div className="request-grid">
        {notifications.length === 0 ? (
          <article className="request-card request-card--empty">
            <h3>Nenhuma notificação no momento</h3>
            <p>Quando um professor solicitar vínculo, ela aparecerá aqui.</p>
          </article>
        ) : (
          notifications.map((notification) => (
            <article key={notification.id} className="request-card">
              <div>
                <span className={`mini-badge mini-badge--${notification.status}`}>
                  {notification.status}
                </span>
                <h3>{notification.professorNome}</h3>
                <p>{notification.professorEmail}</p>
                <p className="request-card__text">
                  Deseja aceitar o vínculo com este professor na sua conta?
                </p>
              </div>

              {notification.status === 'pendente' ? (
                <div className="request-card__actions">
                  <button
                    className="btn btn-primary request-card__button"
                    type="button"
                    onClick={() => handleResponse(notification, 'aceito')}
                    disabled={processingId === notification.id}
                  >
                    <Check size={16} />
                    Aceitar
                  </button>
                  <button
                    className="btn btn-ghost request-card__button"
                    type="button"
                    onClick={() => handleResponse(notification, 'recusado')}
                    disabled={processingId === notification.id}
                  >
                    <X size={16} />
                    Recusar
                  </button>
                </div>
              ) : (
                <div className="request-card__status">
                  <Link2 size={16} />
                  Solicitação {notification.status}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}
