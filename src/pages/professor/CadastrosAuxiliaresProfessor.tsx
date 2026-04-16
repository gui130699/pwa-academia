import { ArrowLeft, PlusCircle, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createMuscleGroup,
  getMuscleGroups,
} from '../../services/exerciseService'
import type { GrupoMuscular } from '../../types/exercise'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function CadastrosAuxiliaresProfessor() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GrupoMuscular[]>([])
  const [groupName, setGroupName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function loadGroups() {
    try {
      const result = await getMuscleGroups()
      setGroups(result)
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os grupos musculares.'))
    }
  }

  useEffect(() => {
    void loadGroups()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    setIsSaving(true)

    try {
      await createMuscleGroup(groupName)
      setGroupName('')
      setShowForm(false)
      setFeedback('Grupo muscular cadastrado com sucesso.')
      await loadGroups()
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível salvar o grupo muscular.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Cadastros auxiliares</span>
      <h2>Grupos musculares</h2>
      <p>Cadastre aqui os grupos musculares que serão usados no cadastro dos exercícios.</p>

      <div className="section-actions">
        <button
          className="btn btn-primary request-card__button"
          type="button"
          onClick={() => setShowForm((current) => !current)}
        >
          <PlusCircle size={16} />
          Novo grupo muscular
        </button>

        <button
          className="btn btn-secondary request-card__button"
          type="button"
          onClick={() => navigate('/professor/cadastro-exercicio')}
        >
          Ir para cadastro de exercício
        </button>

        <button
          className="btn btn-ghost request-card__button"
          type="button"
          onClick={() => navigate('/professor/treinos')}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      {showForm ? (
        <form className="auth-form section-block" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nome do grupo muscular</span>
            <input
              className="app-input"
              type="text"
              placeholder="Ex.: Peito, Costas, Quadríceps"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />
          </label>

          <div className="section-actions">
            <button className="btn btn-primary request-card__button" type="submit" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Salvando...' : 'Salvar grupo muscular'}
            </button>
            <button
              className="btn btn-ghost request-card__button"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div className="section-block">
        <h3 className="section-block__title">Grupos cadastrados</h3>

        <div className="compact-list">
          {groups.length === 0 ? (
            <article className="request-card request-card--empty">
              <div>
                <h3>Nenhum grupo muscular cadastrado</h3>
                <p>Use o botão acima para criar o primeiro cadastro simples.</p>
              </div>
            </article>
          ) : (
            groups.map((group) => (
              <article key={group.id} className="compact-row compact-row--readonly">
                <div className="compact-row__main">
                  <strong>{group.nome}</strong>
                  <span>Cadastro auxiliar disponível para o formulário de exercícios.</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
