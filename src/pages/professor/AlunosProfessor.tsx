import { CheckCircle2, Clock3, Search, UserPlus, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getProfessorLinkRequests,
  sendProfessorLinkRequest,
  searchStudents,
} from '../../services/linkRequestService'
import type { VinculoNotificacao } from '../../types/notification'
import type { UsuarioAluno, UsuarioProfessor } from '../../types/user'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function AlunosProfessor() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<UsuarioAluno[]>([])
  const [requests, setRequests] = useState<VinculoNotificacao[]>([])
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingStudentId, setPendingStudentId] = useState('')

  const acceptedRequests = useMemo(
    () => requests.filter((request) => request.status === 'aceito'),
    [requests],
  )

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pendente'),
    [requests],
  )

  const requestStatusMap = useMemo(
    () => new Map(requests.map((request) => [request.alunoId, request.status])),
    [requests],
  )

  async function loadRequests() {
    if (!profile || profile.tipoConta !== 'professor') {
      return
    }

    try {
      const professorRequests = await getProfessorLinkRequests(profile.uid)
      setRequests(professorRequests)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os vínculos agora.'))
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [profile])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    setIsLoading(true)

    try {
      const foundStudents = await searchStudents(search)
      setResults(foundStudents)

      if (foundStudents.length === 0) {
        setFeedback('Nenhum aluno encontrado com esse filtro.')
      }
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível buscar os alunos agora.'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddStudent(student: UsuarioAluno) {
    if (!profile || profile.tipoConta !== 'professor') {
      setFeedback('Apenas professores podem enviar solicitações de vínculo.')
      return
    }

    setPendingStudentId(student.uid)
    setFeedback('')

    try {
      await sendProfessorLinkRequest({
        professor: profile as UsuarioProfessor,
        student,
      })

      await loadRequests()
      setFeedback(`Solicitação enviada para ${student.nomeCompleto}.`)
    } catch (error) {
      setFeedback(
        getFirebaseErrorMessage(error, 'Não foi possível enviar a solicitação agora.'),
      )
    } finally {
      setPendingStudentId('')
    }
  }

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Alunos</span>
      <h2>Gerenciar vínculos com alunos</h2>
      <p>
        Pesquise alunos cadastrados, envie convites e acompanhe quem já aceitou o vínculo.
      </p>

      <div className="overview-strip">
        <article className="overview-card">
          <Users size={18} />
          <strong>{acceptedRequests.length}</strong>
          <span>Alunos vinculados</span>
        </article>

        <article className="overview-card">
          <Clock3 size={18} />
          <strong>{pendingRequests.length}</strong>
          <span>Solicitações pendentes</span>
        </article>
      </div>

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

      <div className="section-block">
        <h3 className="section-block__title">Resultados da pesquisa</h3>
        <div className="request-grid">
          {results.length === 0 ? (
            <article className="request-card request-card--empty">
              <h3>Nenhum aluno listado ainda</h3>
              <p>Pesquise por nome ou e-mail para localizar um aluno cadastrado.</p>
            </article>
          ) : (
            results.map((student) => {
              const currentStatus = requestStatusMap.get(student.uid)
              const isAccepted = currentStatus === 'aceito'
              const isPending = currentStatus === 'pendente'

              return (
                <article key={student.uid} className="request-card">
                  <div>
                    <h3>{student.nomeCompleto}</h3>
                    <p>{student.email}</p>
                    <span className={`mini-badge ${currentStatus ? `mini-badge--${currentStatus}` : ''}`.trim()}>
                      {isAccepted ? 'Vinculado' : isPending ? 'Pendente' : 'Aluno cadastrado'}
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary request-card__button"
                    type="button"
                    onClick={() => handleAddStudent(student)}
                    disabled={pendingStudentId === student.uid || isAccepted || isPending}
                  >
                    <UserPlus size={16} />
                    {pendingStudentId === student.uid
                      ? 'Enviando...'
                      : isAccepted
                        ? 'Vinculado'
                        : isPending
                          ? 'Solicitação pendente'
                          : 'Adicionar aluno'}
                  </button>
                </article>
              )
            })
          )}
        </div>
      </div>

      <div className="section-block">
        <h3 className="section-block__title">Alunos que aceitaram</h3>
        <div className="request-grid">
          {acceptedRequests.length === 0 ? (
            <article className="request-card request-card--empty">
              <h3>Ainda sem vínculos aceitos</h3>
              <p>Quando um aluno aceitar sua solicitação, ele aparecerá aqui.</p>
            </article>
          ) : (
            acceptedRequests.map((request) => (
              <article key={request.id} className="request-card">
                <div>
                  <span className="mini-badge mini-badge--aceito">Vínculo aceito</span>
                  <h3>{request.alunoNome}</h3>
                  <p>{request.alunoEmail}</p>
                </div>

                <div className="request-card__status">
                  <CheckCircle2 size={16} />
                  Ativo
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
