import { ArrowLeft, Dumbbell, ExternalLink, Layers, Pencil, Target, Weight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getExercises } from '../services/exerciseService'
import { getTrainingPlanById } from '../services/trainingService'
import type { Exercicio } from '../types/exercise'
import type { TreinoMontado } from '../types/training'
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages'

export function VisualizarTreino() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [plan, setPlan] = useState<TreinoMontado | null>(null)
  const [exerciseMap, setExerciseMap] = useState<Map<string, Exercicio>>(new Map())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const isProfessor = profile?.tipoConta === 'professor'
  const backPath = isProfessor ? '/professor/montar-treino' : '/aluno/treinos'

  useEffect(() => {
    if (!id) {
      setError('Treino não encontrado.')
      setLoading(false)
      return
    }

    Promise.all([getTrainingPlanById(id), getExercises()])
      .then(([result, exercises]) => {
        if (!result) {
          setError('Treino não encontrado.')
        } else {
          setPlan(result)
          setExerciseMap(new Map(exercises.map((ex) => [ex.id, ex])))
        }
      })
      .catch((err) => {
        setError(getFirebaseErrorMessage(err, 'Não foi possível carregar o treino.'))
      })
      .finally(() => setLoading(false))
  }, [id])

  function getVideoUrl(exerciseId: string, savedUrl?: string): string {
    if (savedUrl) return savedUrl
    return exerciseMap.get(exerciseId)?.videoInstrucaoUrl ?? ''
  }

  const pageClass = isProfessor ? 'professor-page fade-in-panel' : 'aluno-page fade-in-panel'

  if (loading) {
    return (
      <section className={pageClass}>
        <p>Carregando treino...</p>
      </section>
    )
  }

  if (error || !plan) {
    return (
      <section className={pageClass}>
        <div className="info-banner error-banner panel-feedback">{error || 'Treino não encontrado.'}</div>
        <div className="section-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost request-card__button" type="button" onClick={() => navigate(backPath)}>
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={pageClass}>
      <span className="eyebrow">Ficha de treino</span>
      <h2>{plan.nome}</h2>
      <p className="treino-meta">
        Aluno: <strong>{plan.alunoNome}</strong> &nbsp;·&nbsp; Professor: <strong>{plan.professorNome}</strong>
        &nbsp;·&nbsp; {plan.itens.length} exercício{plan.itens.length !== 1 ? 's' : ''}
      </p>

      <div className="treino-cards">
        {plan.itens.map((item, index) => {
          const isMerged = item.mesclarExercicios && item.exerciseNames.length > 1
          const reps = item.repeticaoPersonalizada
            ? item.repeticaoPersonalizada
            : item.repeticoes

          return (
            <article key={item.id ?? index} className="treino-card">
              <div className="treino-card__number">
                <span>{index + 1}</span>
              </div>

              <div className="treino-card__body">
                <div className="treino-card__names">
                  {isMerged ? (
                    item.exerciseNames.map((name, nameIndex) => {
                      const videoUrl = getVideoUrl(item.exerciseIds[nameIndex] ?? '', item.videoUrls?.[nameIndex])
                      return (
                        <span key={nameIndex} className="treino-card__name-wrap">
                          {nameIndex > 0 && <span className="treino-card__merge-sep">+</span>}
                          <span className="treino-card__name">{name}</span>
                          {videoUrl ? (
                            <a className="treino-card__video" href={videoUrl} target="_blank" rel="noreferrer">
                              <ExternalLink size={12} />
                              Vídeo
                            </a>
                          ) : null}
                        </span>
                      )
                    })
                  ) : (
                    (() => {
                      const videoUrl = getVideoUrl(item.exerciseIds[0] ?? '', item.videoUrls?.[0])
                      return (
                        <span className="treino-card__name-wrap">
                          <span className="treino-card__name">{item.exerciseNames[0] ?? '—'}</span>
                          {videoUrl ? (
                            <a className="treino-card__video" href={videoUrl} target="_blank" rel="noreferrer">
                              <ExternalLink size={12} />
                              Vídeo
                            </a>
                          ) : null}
                        </span>
                      )
                    })()
                  )}
                </div>

                {item.grupoMuscularNome ? (
                  <span className="treino-card__group">
                    <Target size={12} />
                    {item.grupoMuscularNome}
                  </span>
                ) : null}

                <div className="treino-card__stats">
                  <div className="treino-stat">
                    <Layers size={14} />
                    <span>{item.series ?? '—'} séries</span>
                  </div>

                  <div className="treino-stat treino-stat--reps">
                    <Dumbbell size={14} />
                    <span>{reps || '—'} reps</span>
                  </div>

                  {item.carga ? (
                    <div className="treino-stat">
                      <Weight size={14} />
                      <span>{item.carga}</span>
                    </div>
                  ) : null}
                </div>

                {item.observacoes ? (
                  <p className="treino-card__obs">{item.observacoes}</p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      <div className="section-actions" style={{ marginTop: 24 }}>
        {isProfessor ? (
          <button
            className="btn btn-secondary request-card__button"
            type="button"
            onClick={() => navigate('/professor/montar-treino', { state: { plan } })}
          >
            <Pencil size={16} />
            Editar treino
          </button>
        ) : null}
        <button className="btn btn-ghost request-card__button" type="button" onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>
    </section>
  )
}
