import { Search, UserRoundPlus } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getStudentNotifications,
  searchStudentFriends,
  sendFriendRequest,
} from '../../services/linkRequestService'
import type { AmizadeNotificacao } from '../../types/notification'
import type { UsuarioAluno } from '../../types/user'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function AmigosAluno() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<UsuarioAluno[]>([])
  const [notifications, setNotifications] = useState<AmizadeNotificacao[]>([])
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingFriendId, setPendingFriendId] = useState('')

  const friendshipStatusMap = useMemo(
    () =>
      new Map(
        notifications.flatMap((notification) => {
          const otherId =
            notification.remetenteId === profile?.uid
              ? notification.destinatarioId
              : notification.remetenteId

          return [[otherId, notification.status] as const]
        }),
      ),
    [notifications, profile?.uid],
  )

  async function loadFriendNotifications() {
    if (!profile || profile.tipoConta !== 'aluno') {
      return
    }

    try {
      const currentNotifications = await getStudentNotifications(profile.uid)
      setNotifications(
        currentNotifications.filter(
          (notification): notification is AmizadeNotificacao =>
            notification.tipo === 'amizade_aluno',
        ),
      )
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar as amizades.'))
    }
  }

  useEffect(() => {
    void loadFriendNotifications()
  }, [profile])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!profile || profile.tipoConta !== 'aluno') {
      return
    }

    setFeedback('')
    setIsLoading(true)

    try {
      const foundFriends = await searchStudentFriends(search, profile.uid)
      setResults(foundFriends)

      if (foundFriends.length === 0) {
        setFeedback('Nenhum aluno encontrado com esse filtro.')
      }
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível buscar amigos agora.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendFriendRequest(friend: UsuarioAluno) {
    if (!profile || profile.tipoConta !== 'aluno') {
      return
    }

    setPendingFriendId(friend.uid)
    setFeedback('')

    try {
      await sendFriendRequest({ fromAluno: profile, toAluno: friend })
      await loadFriendNotifications()
      setFeedback(`Solicitação de amizade enviada para ${friend.nomeCompleto}.`)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível enviar a solicitação.'))
    } finally {
      setPendingFriendId('')
    }
  }

  return (
    <section className="aluno-page fade-in-panel">
      <span className="eyebrow">Amigos</span>
      <h2>Adicionar amigos</h2>
      <p>Pesquise outros alunos cadastrados e envie solicitações de amizade.</p>

      <form className="search-panel" onSubmit={handleSearch}>
        <div className="search-panel__field">
          <Search size={18} />
          <input
            className="search-panel__input"
            type="text"
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button className="btn btn-primary search-panel__button" type="submit">
          {isLoading ? 'Pesquisando...' : 'Pesquisar'}
        </button>
      </form>

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      <div className="compact-list section-block">
        {results.length === 0 ? (
          <article className="request-card request-card--empty">
            <h3>Nenhum amigo listado ainda</h3>
            <p>Pesquise por nome ou e-mail para localizar um aluno.</p>
          </article>
        ) : (
          results.map((student) => {
            const currentStatus = friendshipStatusMap.get(student.uid)
            const isPending = currentStatus === 'pendente'
            const isAccepted = currentStatus === 'aceito'

            return (
              <article key={student.uid} className="compact-row compact-row--readonly">
                <div className="compact-row__main">
                  <strong>{student.nomeCompleto}</strong>
                  <span>{student.email}</span>
                </div>

                <span className={`mini-badge ${currentStatus ? `mini-badge--${currentStatus}` : ''}`.trim()}>
                  {isAccepted ? 'Amigo' : isPending ? 'Pendente' : 'Disponível'}
                </span>

                <button
                  className="btn btn-secondary request-card__button"
                  type="button"
                  onClick={() => handleSendFriendRequest(student)}
                  disabled={pendingFriendId === student.uid || isPending || isAccepted}
                >
                  <UserRoundPlus size={16} />
                  {pendingFriendId === student.uid
                    ? 'Enviando...'
                    : isAccepted
                      ? 'Amigo'
                      : isPending
                        ? 'Pendente'
                        : 'Adicionar amigo'}
                </button>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
