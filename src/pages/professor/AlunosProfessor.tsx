import { Search, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sendProfessorLinkRequest, searchStudents } from '../../services/linkRequestService'
import type { UsuarioAluno, UsuarioProfessor } from '../../types/user'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function AlunosProfessor() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<UsuarioAluno[]>([])
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingStudentId, setPendingStudentId] = useState('')

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
        Pesquise alunos cadastrados e envie uma solicitação de vínculo para a conta deles.
      </p>

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

      <div className="request-grid">
        {results.map((student) => (
          <article key={student.uid} className="request-card">
            <div>
              <h3>{student.nomeCompleto}</h3>
              <p>{student.email}</p>
              <span className="mini-badge">Aluno cadastrado</span>
            </div>

            <button
              className="btn btn-secondary request-card__button"
              type="button"
              onClick={() => handleAddStudent(student)}
              disabled={pendingStudentId === student.uid}
            >
              <UserPlus size={16} />
              {pendingStudentId === student.uid ? 'Enviando...' : 'Adicionar aluno'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
