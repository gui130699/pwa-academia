import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAlunoTrainingPlans } from '../../services/trainingService'
import type { TreinoMontado } from '../../types/training'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function TreinosAluno() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<TreinoMontado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile) return

    getAlunoTrainingPlans(profile.uid)
      .then(setPlans)
      .catch((err) => setError(getFirebaseErrorMessage(err, 'Não foi possível carregar os treinos.')))
      .finally(() => setLoading(false))
  }, [profile])

  return (
    <section className="aluno-page fade-in-panel">
      <span className="eyebrow">Treinos</span>
      <h2>Meus treinos</h2>
      <p>Clique em uma ficha para ver os exercícios, séries, repetições e carga.</p>

      {error ? <div className="info-banner error-banner panel-feedback">{error}</div> : null}

      {loading ? (
        <p style={{ marginTop: 16, color: '#94a3b8' }}>Carregando treinos...</p>
      ) : plans.length === 0 ? (
        <article className="request-card request-card--empty" style={{ marginTop: 18 }}>
          <div>
            <h3>Nenhum treino encontrado</h3>
            <p>Aguarde seu professor montar uma ficha de treino para você.</p>
          </div>
        </article>
      ) : (
        <div className="compact-list" style={{ marginTop: 18 }}>
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="compact-row compact-row--clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/aluno/treino/${plan.id}`)}
              onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/aluno/treino/${plan.id}`) }}
            >
              <div className="compact-row__main">
                <strong>{plan.nome}</strong>
                <span>{plan.itens.length} exercício{plan.itens.length !== 1 ? 's' : ''}</span>
                <span>{plan.itens.map((item) => item.grupoMuscularNome).filter(Boolean).join(' · ')}</span>
              </div>
              <span className="mini-badge mini-badge--aceito">Ver ficha</span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

