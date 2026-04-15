import { List, PlusSquare } from 'lucide-react'
import { useState } from 'react'

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
          <h3 className="section-block__title">Lista de exercícios</h3>

          <article className="request-card request-card--empty">
            <h3>Nenhum exercício cadastrado ainda</h3>
            <p>Use o botão de cadastro para começar a montar sua biblioteca de exercícios.</p>
          </article>
        </div>
      ) : null}
    </section>
  )
}
