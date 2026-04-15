import { List, PlusSquare } from 'lucide-react'
import { useState } from 'react'

const exercisePlaceholders = [
  'Agachamento livre',
  'Supino reto',
  'Remada baixa',
  'Leg press',
  'Desenvolvimento com halteres',
]

export function TreinosProfessor() {
  const [showExerciseList, setShowExerciseList] = useState(false)

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Treinos</span>
      <h2>Treinos</h2>
      <p>Organize os treinos e mantenha uma estrutura pronta para cadastrar exercícios.</p>

      <div className="section-actions">
        <button
          className="btn btn-secondary request-card__button"
          type="button"
          onClick={() => setShowExerciseList((current) => !current)}
        >
          <List size={16} />
          {showExerciseList ? 'Ocultar lista de exercícios' : 'Lista de exercícios'}
        </button>

        <button className="btn btn-primary request-card__button" type="button">
          <PlusSquare size={16} />
          Cadastrar novo exercício
        </button>
      </div>

      {showExerciseList ? (
        <div className="section-block">
          <h3 className="section-block__title">Exercícios cadastráveis</h3>

          <div className="compact-list">
            {exercisePlaceholders.map((exercise) => (
              <article key={exercise} className="compact-row compact-row--readonly">
                <div className="compact-row__main">
                  <strong>{exercise}</strong>
                  <span>Estrutura visual pronta para uso futuro</span>
                </div>

                <span className="mini-badge">Exercício</span>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
