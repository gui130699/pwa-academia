import { ExternalLink, List, Pencil, PlusSquare } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercises, getMuscleGroups } from '../../services/exerciseService'
import type { Exercicio, GrupoMuscular } from '../../types/exercise'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function TreinosProfessor() {
  const navigate = useNavigate()
  const [showExerciseList, setShowExerciseList] = useState(false)
  const [exercises, setExercises] = useState<Exercicio[]>([])
  const [groups, setGroups] = useState<GrupoMuscular[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [feedback, setFeedback] = useState('')

  async function loadExercises() {
    try {
      const [exerciseResult, groupResult] = await Promise.all([getExercises(), getMuscleGroups()])
      setExercises(exerciseResult)
      setGroups(groupResult)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os exercícios.'))
    }
  }

  const filteredExercises = useMemo(() => {
    if (!selectedGroupId) {
      return []
    }

    return exercises.filter((exercise) => exercise.grupoMuscularId === selectedGroupId)
  }, [exercises, selectedGroupId])

  const selectedGroupName = groups.find((group) => group.id === selectedGroupId)?.nome ?? ''

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
          <h3 className="section-block__title">Lista de exercícios por grupo muscular</h3>

          <label className="form-field">
            <span>Selecione o grupo muscular</span>
            <select
              className="app-input"
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
            >
              <option value="">Escolha um grupo muscular</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="compact-list">
            {groups.length === 0 ? (
              <article className="request-card request-card--empty">
                <h3>Nenhum grupo muscular cadastrado</h3>
                <p>Cadastre um grupo muscular antes de organizar os exercícios.</p>
              </article>
            ) : !selectedGroupId ? (
              <article className="request-card request-card--empty">
                <h3>Selecione um grupo muscular</h3>
                <p>Ao selecionar um grupo, a lista dos exercícios referentes será exibida aqui.</p>
              </article>
            ) : filteredExercises.length === 0 ? (
              <article className="request-card request-card--empty">
                <h3>Nenhum exercício em {selectedGroupName}</h3>
                <p>Use o botão de cadastro para adicionar exercícios neste grupo muscular.</p>
              </article>
            ) : (
              filteredExercises.map((exercise) => (
                <article key={exercise.id} className="compact-row compact-row--readonly">
                  <div className="compact-row__main">
                    <strong>{exercise.nome ?? 'Exercício cadastrado'}</strong>
                    <span>{exercise.descricao}</span>
                    <span>Grupo muscular: {exercise.grupoMuscularNome}</span>
                    <span>{exercise.criadoPorNome ? `Cadastrado por ${exercise.criadoPorNome}` : 'Cadastro disponível para uso.'}</span>
                  </div>
                  <div className="request-card__actions">
                    <button
                      className="btn btn-secondary request-card__button"
                      type="button"
                      onClick={() => navigate('/professor/cadastro-exercicio', { state: { exercise } })}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <a
                      className="btn btn-ghost request-card__button"
                      href={exercise.videoInstrucaoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                      Ver vídeo
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
