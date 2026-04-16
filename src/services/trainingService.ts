import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { NovoTreinoPayload, TreinoItem, TreinoMontado } from '../types/training'

const trainingCollection = collection(db, 'treinos')

function normalizeTrainingItems(items: TreinoItem[]) {
  if (items.length === 0) {
    throw new Error('Adicione pelo menos um exercício ao treino.')
  }

  return items.map((item, index) => {
    const exerciseIds = Array.from(new Set(item.exerciseIds.filter(Boolean)))
    const exerciseNames = Array.from(
      new Set(item.exerciseNames.map((name) => name.trim()).filter(Boolean)),
    )
    const repeticoes = item.repeticoes.trim()
    const repeticaoPersonalizadaValores = (item.repeticaoPersonalizadaValores ?? [])
      .map((value) => value.trim())
      .filter(Boolean)
    const repeticaoPersonalizada =
      repeticaoPersonalizadaValores.length > 0
        ? repeticaoPersonalizadaValores.join('-')
        : item.repeticaoPersonalizada?.trim() ?? ''
    const observacoes = item.observacoes?.trim() ?? ''
    const carga = item.carga?.trim() ?? ''

    if (exerciseIds.length === 0 || exerciseNames.length === 0) {
      throw new Error(`Selecione ao menos um exercício no bloco ${index + 1}.`)
    }

    if (!repeticoes && !repeticaoPersonalizada) {
      throw new Error(`Informe a repetição ou a repetição personalizada no bloco ${index + 1}.`)
    }

    return {
      id: item.id,
      exerciseIds,
      exerciseNames,
      repeticoes,
      repeticaoPersonalizada,
      repeticaoPersonalizadaValores,
      observacoes,
      carga,
      grupoMuscularId: item.grupoMuscularId ?? '',
      grupoMuscularNome: item.grupoMuscularNome ?? '',
      mesclarExercicios: item.mesclarExercicios,
    }
  })
}

export async function createTrainingPlan(payload: NovoTreinoPayload) {
  const nome = payload.nome.trim() || 'Treino personalizado'

  if (!payload.alunoId || !payload.professorId) {
    throw new Error('Selecione um aluno vinculado para salvar o treino.')
  }

  const itens = normalizeTrainingItems(payload.itens)

  await addDoc(trainingCollection, {
    nome,
    alunoId: payload.alunoId,
    alunoNome: payload.alunoNome,
    professorId: payload.professorId,
    professorNome: payload.professorNome,
    itens,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  })
}

export async function getProfessorTrainingPlans(professorId: string): Promise<TreinoMontado[]> {
  const snapshot = await getDocs(query(trainingCollection, where('professorId', '==', professorId)))

  return snapshot.docs
    .map((currentDoc) => ({
      id: currentDoc.id,
      ...(currentDoc.data() as Omit<TreinoMontado, 'id'>),
    }))
    .sort((first, second) => second.nome.localeCompare(first.nome, 'pt-BR'))
}
