import { ExternalLink, List, PlusSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercises } from '../../services/exerciseService'
import type { Exercicio } from '../../types/exercise'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function TreinosProfessor() {
  const navigate = useNavigate()
  const [showExerciseList, setShowExerciseList] = useState(false)
  const [exercises, setExercises] = useState<Exercicio[]>([])
  const [feedback, setFeedback] = useState('')

  async function loadExercises() {
    try {
      const result = await getExercises()
      setExercises(result)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os exercícios.'))
    }
  }

  useEffect(() => {
    void loadExercises()
  }, [])

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Treinos</span>
      <h2>Treinos</h2>
      <p>Organize os treinos e mantenha uma estrutura pronta para cadastrar exercícios.</p>

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      <div className="section-actions">
        <button
          className="btn btn-secondary request-card__button"
          type="button"
          onClick={() => setShowExerciseList((current) => !current)}
        >
          <List size={16} />
          {showExerciseList ? 'Ocultar lista de exercícios' : 'Lista de exercícios'}
        </button>

        <button
          className="btn btn-secondary request-card__button"
          type="button"
          onClick={() => navigate('/professor/cadastros-auxiliares')}
        >
          Cadastros auxiliares
        </button>

        <button
          className="btn btn-primary request-card__button"
          type="button"
          onClick={() => navigate('/professor/cadastro-exercicio')}
        >
          <PlusSquare size={16} />
          Cadastrar novo exercício
        </button>
      </div>

      {showExerciseList ? (
        <div className="section-block">
          <h3 className="section-block__title">Lista de exercícios</h3>

          <div className="compact-list">
            {exercises.length === 0 ? (
              <article className="request-card request-card--empty">
                <h3>Nenhum exercício cadastrado ainda</h3>
                <p>Use o botão de cadastro para começar a montar sua biblioteca de exercícios.</p>
              </article>
            ) : (
              exercises.map((exercise) => (
                <article key={exercise.id} className="compact-row compact-row--readonly">
                  <div className="compact-row__main">
                    <strong>{exercise.descricao}</strong>
                    <span>Grupo muscular: {exercise.grupoMuscularNome}</span>
                    <span>{exercise.criadoPorNome ? `Cadastrado por ${exercise.criadoPorNome}` : 'Cadastro disponível para uso.'}</span>
                  </div>
                  <a
                    className="btn btn-ghost request-card__button"
                    href={exercise.videoInstrucaoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                    Ver vídeo
                  </a>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
