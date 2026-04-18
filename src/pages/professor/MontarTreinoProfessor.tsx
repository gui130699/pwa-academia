import { ArrowLeft, PlusSquare, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getExercises, getMuscleGroups } from '../../services/exerciseService'
import { getProfessorLinkRequests } from '../../services/linkRequestService'
import { createTrainingPlan, getProfessorTrainingPlans, updateTrainingPlan } from '../../services/trainingService'
import type { Exercicio, GrupoMuscular } from '../../types/exercise'
import type { TreinoMontado } from '../../types/training'
import type { UsuarioProfessor } from '../../types/user'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

interface LinkedStudent {
  uid: string
  nome: string
  email: string
}

interface LocalTreinoItem {
  localId: string
  groupId: string
  mainExerciseId: string
  extraExerciseIds: string[]
  mergeEnabled: boolean
  series: string
  repetitions: string
  customRepetitionEnabled: boolean
  customRepetitionCount: string
  customRepetitionValues: string[]
  observations: string
  load: string
}

function createEmptyItem(): LocalTreinoItem {
  return {
    localId: crypto.randomUUID(),
    groupId: '',
    mainExerciseId: '',
    extraExerciseIds: [],
    mergeEnabled: false,
    series: '',
    repetitions: '',
    customRepetitionEnabled: false,
    customRepetitionCount: '4',
    customRepetitionValues: ['', '', '', ''],
    observations: '',
    load: '',
  }
}

export function MontarTreinoProfessor() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const editingPlan = useMemo(
    () => ((location.state as { plan?: TreinoMontado } | null)?.plan ?? null),
    [location.state],
  )
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([])
  const [groups, setGroups] = useState<GrupoMuscular[]>([])
  const [exercises, setExercises] = useState<Exercicio[]>([])
  const [savedPlans, setSavedPlans] = useState<TreinoMontado[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [trainingName, setTrainingName] = useState('Treino A')
  const [items, setItems] = useState<LocalTreinoItem[]>([createEmptyItem()])
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function loadData() {
    if (!profile || profile.tipoConta !== 'professor') {
      return
    }

    try {
      const [requests, exerciseResult, groupResult, plans] = await Promise.all([
        getProfessorLinkRequests(profile.uid),
        getExercises(),
        getMuscleGroups(),
        getProfessorTrainingPlans(profile.uid),
      ])

      const acceptedStudents = requests
        .filter((request) => request.status === 'aceito')
        .map((request) => ({
          uid: request.alunoId,
          nome: request.alunoNome,
          email: request.alunoEmail,
        }))

      setLinkedStudents(acceptedStudents)
      setExercises(exerciseResult)
      setGroups(groupResult)
      setSavedPlans(plans)

      if (!selectedStudentId && acceptedStudents.length > 0) {
        setSelectedStudentId(acceptedStudents[0].uid)
      }
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os dados para montar o treino.'))
    }
  }

  useEffect(() => {
    void loadData()
  }, [profile])

  useEffect(() => {
    if (!editingPlan) return

    setTrainingName(editingPlan.nome)
    setSelectedStudentId(editingPlan.alunoId)
    setItems(
      editingPlan.itens.map((item) => {
        const hasCustom = !!item.repeticaoPersonalizada
        const customValues = item.repeticaoPersonalizadaValores ?? []
        return {
          localId: item.id || crypto.randomUUID(),
          groupId: item.grupoMuscularId ?? '',
          mainExerciseId: item.exerciseIds[0] ?? '',
          extraExerciseIds: item.mesclarExercicios ? item.exerciseIds.slice(1) : [],
          mergeEnabled: item.mesclarExercicios,
          series: item.series ?? '',
          repetitions: hasCustom ? '' : item.repeticoes,
          customRepetitionEnabled: hasCustom,
          customRepetitionCount: hasCustom ? String(customValues.length || 4) : '4',
          customRepetitionValues: hasCustom && customValues.length > 0 ? customValues : ['', '', '', ''],
          observations: item.observacoes ?? '',
          load: item.carga ?? '',
        }
      }),
    )
  }, [editingPlan])

  function updateItem(localId: string, patch: Partial<LocalTreinoItem>) {
    setItems((current) => current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)))
  }

  function toggleExtraExercise(localId: string, exerciseId: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.localId !== localId) {
          return item
        }

        const exists = item.extraExerciseIds.includes(exerciseId)

        return {
          ...item,
          extraExerciseIds: exists
            ? item.extraExerciseIds.filter((currentId) => currentId !== exerciseId)
            : [...item.extraExerciseIds, exerciseId],
        }
      }),
    )
  }

  function updateCustomRepetitionCount(localId: string, countValue: string) {
    const parsedCount = Math.max(1, Number.parseInt(countValue || '1', 10) || 1)

    setItems((current) =>
      current.map((item) => {
        if (item.localId !== localId) {
          return item
        }

        return {
          ...item,
          customRepetitionCount: String(parsedCount),
          customRepetitionValues: Array.from({ length: parsedCount }, (_, index) => item.customRepetitionValues[index] ?? ''),
        }
      }),
    )
  }

  function updateCustomRepetitionValue(localId: string, valueIndex: number, value: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.localId !== localId) {
          return item
        }

        const nextValues = [...item.customRepetitionValues]
        nextValues[valueIndex] = value

        return {
          ...item,
          customRepetitionValues: nextValues,
        }
      }),
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    setIsSaving(true)

    try {
      if (!profile || profile.tipoConta !== 'professor') {
        throw new Error('Apenas professores podem montar treinos.')
      }

      const selectedStudent = linkedStudents.find((student) => student.uid === selectedStudentId)

      if (!selectedStudent) {
        throw new Error('Selecione um aluno vinculado.')
      }

      const formattedItems = items.map((item) => {
        const selectedExerciseIds = [item.mainExerciseId, ...item.extraExerciseIds]
          .filter(Boolean)
          .filter((exerciseId, index, array) => array.indexOf(exerciseId) === index)

        const selectedExercises = exercises.filter((exercise) => selectedExerciseIds.includes(exercise.id))
        const selectedGroup = groups.find((group) => group.id === item.groupId)

        return {
          id: item.localId,
          exerciseIds: selectedExercises.map((exercise) => exercise.id),
          exerciseNames: selectedExercises.map((exercise) => exercise.nome ?? exercise.descricao),
          videoUrls: selectedExercises.map((exercise) => exercise.videoInstrucaoUrl ?? ''),
          series: item.series,
          repeticoes: item.customRepetitionEnabled ? '' : item.repetitions,
          repeticaoPersonalizada: item.customRepetitionEnabled
            ? item.customRepetitionValues.map((value) => value.trim()).filter(Boolean).join('-')
            : '',
          repeticaoPersonalizadaValores: item.customRepetitionEnabled
            ? item.customRepetitionValues.map((value) => value.trim()).filter(Boolean)
            : [],
          observacoes: item.observations,
          carga: item.load,
          grupoMuscularId: item.groupId,
          grupoMuscularNome: selectedGroup?.nome ?? '',
          mesclarExercicios: item.mergeEnabled,
        }
      })

      if (editingPlan?.id) {
        await updateTrainingPlan(editingPlan.id, {
          nome: trainingName,
          alunoId: selectedStudent.uid,
          alunoNome: selectedStudent.nome,
          professorId: (profile as UsuarioProfessor).uid,
          professorNome: (profile as UsuarioProfessor).nomeCompleto,
          itens: formattedItems,
        })
        setFeedback('Treino atualizado com sucesso.')
      } else {
        await createTrainingPlan({
          nome: trainingName,
          alunoId: selectedStudent.uid,
          alunoNome: selectedStudent.nome,
          professorId: (profile as UsuarioProfessor).uid,
          professorNome: (profile as UsuarioProfessor).nomeCompleto,
          itens: formattedItems,
        })
        setFeedback(`Treino salvo com sucesso para ${selectedStudent.nome}.`)
        setTrainingName('Treino A')
        setItems([createEmptyItem()])
      }
      await loadData()
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível salvar o treino.'))
    } finally {
      setIsSaving(false)
    }
  }

  const plansForStudent = useMemo(() => {
    if (!selectedStudentId) {
      return []
    }

    return savedPlans.filter((plan) => plan.alunoId === selectedStudentId)
  }, [savedPlans, selectedStudentId])

  return (
    <section className="professor-page fade-in-panel">
      <span className="eyebrow">Montar treino</span>
      <h2>{editingPlan ? 'Editar treino' : 'Montar treino do aluno'}</h2>
      <p>{editingPlan ? 'Altere os exercícios, séries, repetições e carga e salve.' : 'Selecione um aluno vinculado, escolha os exercícios e monte a ficha com repetições, carga e observações.'}</p>

      {feedback ? <div className="info-banner success-banner panel-feedback">{feedback}</div> : null}

      <form className="auth-form section-block" onSubmit={handleSubmit}>
        <div className="auth-grid">
          <label className="form-field">
            <span>Aluno vinculado</span>
            <select
              className="app-input"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
            >
              <option value="">Selecione um aluno</option>
              {linkedStudents.map((student) => (
                <option key={student.uid} value={student.uid}>
                  {student.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Nome do treino</span>
            <input
              className="app-input"
              type="text"
              placeholder="Ex.: Treino A - Peito e tríceps"
              value={trainingName}
              onChange={(event) => setTrainingName(event.target.value)}
            />
          </label>
        </div>

        <div className="section-actions">
          <button
            className="btn btn-secondary request-card__button"
            type="button"
            onClick={() => setItems((current) => [...current, createEmptyItem()])}
          >
            <PlusSquare size={16} />
            Adicionar exercício
          </button>
        </div>

        <div className="compact-list">
          {items.map((item, index) => {
            const filteredOptions = item.groupId
              ? exercises.filter((exercise) => exercise.grupoMuscularId === item.groupId)
              : exercises

            return (
              <article key={item.localId} className="request-card request-card--compact">
                <div style={{ width: '100%' }}>
                  <h3>Exercício {index + 1}</h3>

                  <div className="auth-grid">
                    <label className="form-field">
                      <span>Grupo muscular</span>
                      <select
                        className="app-input"
                        value={item.groupId}
                        onChange={(event) =>
                          updateItem(item.localId, {
                            groupId: event.target.value,
                            mainExerciseId: '',
                            extraExerciseIds: [],
                          })
                        }
                      >
                        <option value="">Todos os grupos</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Exercício principal</span>
                      <select
                        className="app-input"
                        value={item.mainExerciseId}
                        onChange={(event) => updateItem(item.localId, { mainExerciseId: event.target.value })}
                      >
                        <option value="">Selecione o exercício</option>
                        {filteredOptions.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {(exercise.nome ?? exercise.descricao) + ' • ' + exercise.grupoMuscularNome}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="form-field" style={{ marginTop: 12 }}>
                    <span>
                      <input
                        type="checkbox"
                        checked={item.mergeEnabled}
                        onChange={(event) =>
                          updateItem(item.localId, {
                            mergeEnabled: event.target.checked,
                            extraExerciseIds: event.target.checked ? item.extraExerciseIds : [],
                          })
                        }
                      />{' '}
                      Mesclar exercício
                    </span>
                  </label>

                  {item.mergeEnabled ? (
                    <div className="compact-list" style={{ marginTop: 10 }}>
                      {filteredOptions
                        .filter((exercise) => exercise.id !== item.mainExerciseId)
                        .map((exercise) => (
                          <label key={exercise.id} className="compact-row compact-row--readonly">
                            <div className="compact-row__main">
                              <strong>{exercise.nome ?? 'Exercício'}</strong>
                              <span>{exercise.grupoMuscularNome}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={item.extraExerciseIds.includes(exercise.id)}
                              onChange={() => toggleExtraExercise(item.localId, exercise.id)}
                            />
                          </label>
                        ))}
                    </div>
                  ) : null}

                  <div className="auth-grid" style={{ marginTop: 12 }}>
                    <label className="form-field">
                      <span>Número de séries</span>
                      <input
                        className="app-input"
                        type="number"
                        min="1"
                        placeholder="Ex.: 4"
                        value={item.series}
                        onChange={(event) => updateItem(item.localId, { series: event.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Número de repetições</span>
                      <input
                        className="app-input"
                        type="number"
                        min="1"
                        placeholder="Ex.: 12"
                        value={item.repetitions}
                        disabled={item.customRepetitionEnabled}
                        onChange={(event) => updateItem(item.localId, { repetitions: event.target.value })}
                      />
                    </label>
                  </div>

                  <label className="form-field" style={{ marginTop: 12 }}>
                    <span>
                      <input
                        type="checkbox"
                        checked={item.customRepetitionEnabled}
                        onChange={(event) =>
                          updateItem(item.localId, {
                            customRepetitionEnabled: event.target.checked,
                            repetitions: event.target.checked ? '' : item.repetitions,
                            customRepetitionCount: event.target.checked ? item.customRepetitionCount || '4' : '4',
                            customRepetitionValues: event.target.checked
                              ? (item.customRepetitionValues.length > 0 ? item.customRepetitionValues : ['', '', '', ''])
                              : ['', '', '', ''],
                          })
                        }
                      />{' '}
                      Usar repetição personalizada
                    </span>
                  </label>

                  {item.customRepetitionEnabled ? (
                    <div className="section-block" style={{ marginTop: 12 }}>
                      <div className="auth-grid">
                        <label className="form-field">
                          <span>Quantidade de campos personalizados</span>
                          <input
                            className="app-input"
                            type="number"
                            min="1"
                            max="12"
                            value={item.customRepetitionCount}
                            onChange={(event) => updateCustomRepetitionCount(item.localId, event.target.value)}
                          />
                        </label>
                      </div>

                      <div className="auth-grid" style={{ marginTop: 12 }}>
                        {item.customRepetitionValues.map((value, valueIndex) => (
                          <label key={`${item.localId}_${valueIndex}`} className="form-field">
                            <span>Campo {valueIndex + 1}</span>
                            <input
                              className="app-input"
                              type="number"
                              min="0"
                              placeholder="0"
                              value={value}
                              onChange={(event) =>
                                updateCustomRepetitionValue(item.localId, valueIndex, event.target.value)
                              }
                            />
                          </label>
                        ))}
                      </div>

                      <p>
                        Sequência personalizada: {item.customRepetitionValues.map((value) => value || '0').join('-')}
                      </p>
                    </div>
                  ) : null}

                  <div className="auth-grid" style={{ marginTop: 12 }}>
                    <label className="form-field">
                      <span>Carga</span>
                      <input
                        className="app-input"
                        type="text"
                        placeholder="Ex.: 20kg"
                        value={item.load}
                        onChange={(event) => updateItem(item.localId, { load: event.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Observações do exercício</span>
                      <input
                        className="app-input"
                        type="text"
                        placeholder="Ex.: manter postura, intervalo de 45s"
                        value={item.observations}
                        onChange={(event) => updateItem(item.localId, { observations: event.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <button
                  className="btn btn-ghost request-card__button"
                  type="button"
                  onClick={() => setItems((current) => (current.length > 1 ? current.filter((currentItem) => currentItem.localId !== item.localId) : current))}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              </article>
            )
          })}
        </div>

        <div className="section-actions">
          <button className="btn btn-primary request-card__button" type="submit" disabled={isSaving || linkedStudents.length === 0}>
            <Save size={16} />
            {isSaving ? 'Salvando...' : editingPlan ? 'Salvar alterações' : 'Salvar treino'}
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

      <div className="section-block">
        <h3 className="section-block__title">Treinos já montados</h3>
        <div className="compact-list">
          {plansForStudent.length === 0 ? (
            <article className="request-card request-card--empty">
              <h3>Nenhum treino salvo para este aluno</h3>
              <p>Depois de salvar, a ficha aparecerá aqui com os exercícios montados.</p>
            </article>
          ) : (
            plansForStudent.map((plan) => (
              <article
                key={plan.id}
                className="compact-row compact-row--clickable"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/professor/treino/${plan.id}`)}
                onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/professor/treino/${plan.id}`) }}
              >
                <div className="compact-row__main">
                  <strong>{plan.nome}</strong>
                  <span>{plan.alunoNome}</span>
                  <span>{plan.itens.map((item) => item.exerciseNames.join(' + ')).join(' • ')}</span>
                </div>
                <span className="mini-badge mini-badge--aceito">Ver ficha</span>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
