import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  createExercise,
  getMuscleGroups,
} from '../../services/exerciseService'
import type { GrupoMuscular } from '../../types/exercise'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function CadastroExercicioProfessor() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState<GrupoMuscular[]>([])
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    grupoMuscularId: '',
    videoInstrucaoUrl: '',
  })

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
      const selectedGroup = groups.find((group) => group.id === formData.grupoMuscularId)

      if (!selectedGroup) {
        throw new Error('Selecione um grupo muscular válido.')
      }

      await createExercise({
        nome: formData.nome,
        descricao: formData.descricao,
        grupoMuscularId: selectedGroup.id,
        grupoMuscularNome: selectedGroup.nome,
        videoInstrucaoUrl: formData.videoInstrucaoUrl,
        criadoPorId: user?.uid,
        criadoPorNome: profile?.nomeCompleto,
      })

      setFormData({ nome: '', descricao: '', grupoMuscularId: '', videoInstrucaoUrl: '' })
      setFeedback('Exercício cadastrado com sucesso.')
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível salvar o exercício.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Cadastro de exercício</span>
      <h2>Novo exercício</h2>
      <p>Preencha o nome do exercício, a descrição, selecione o grupo muscular e cole o link do vídeo de instrução.</p>

      {groups.length === 0 ? (
        <div className="info-banner warning-banner panel-feedback">
          Cadastre pelo menos um grupo muscular antes de salvar um exercício.
        </div>
      ) : null}

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      <form className="auth-form section-block" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Nome do exercício</span>
          <input
            className="app-input"
            type="text"
            placeholder="Ex.: Supino reto com barra"
            value={formData.nome}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                nome: event.target.value,
              }))
            }
          />
        </label>

        <label className="form-field">
          <span>Descrição do exercício</span>
          <textarea
            className="app-input"
            rows={4}
            placeholder="Descreva a execução do exercício"
            value={formData.descricao}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                descricao: event.target.value,
              }))
            }
          />
        </label>

        <label className="form-field">
          <span>Grupo muscular</span>
          <select
            className="app-input"
            value={formData.grupoMuscularId}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                grupoMuscularId: event.target.value,
              }))
            }
          >
            <option value="">Selecione um grupo muscular</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Vídeo de instrução</span>
          <input
            className="app-input"
            type="url"
            placeholder="Cole aqui o link do vídeo"
            value={formData.videoInstrucaoUrl}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                videoInstrucaoUrl: event.target.value,
              }))
            }
          />
        </label>

        <div className="section-actions">
          <button
            className="btn btn-primary request-card__button"
            type="submit"
            disabled={isSaving || groups.length === 0}
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar exercício'}
          </button>

          <button
            className="btn btn-secondary request-card__button"
            type="button"
            onClick={() => navigate('/professor/cadastros-auxiliares')}
          >
            Cadastros auxiliares
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
      </form>
    </section>
  )
}
