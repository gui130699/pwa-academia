import { addDoc, collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Exercicio, GrupoMuscular, NovoExercicioPayload } from '../types/exercise'

const muscleGroupsCollection = collection(db, 'gruposMusculares')
const exercisesCollection = collection(db, 'exercicios')

export async function getMuscleGroups(): Promise<GrupoMuscular[]> {
  const snapshot = await getDocs(muscleGroupsCollection)

  return snapshot.docs
    .map((currentDoc) => ({
      id: currentDoc.id,
      ...(currentDoc.data() as Omit<GrupoMuscular, 'id'>),
    }))
    .sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'))
}

export async function createMuscleGroup(nome: string) {
  const normalizedName = nome.trim()

  if (!normalizedName) {
    throw new Error('Informe o nome do grupo muscular.')
  }

  await addDoc(muscleGroupsCollection, {
    nome: normalizedName,
    criadoEm: serverTimestamp(),
  })
}

export async function getExercises(): Promise<Exercicio[]> {
  const snapshot = await getDocs(exercisesCollection)

  return snapshot.docs
    .map((currentDoc) => ({
      id: currentDoc.id,
      ...(currentDoc.data() as Omit<Exercicio, 'id'>),
    }))
    .sort((first, second) => {
      const groupCompare = first.grupoMuscularNome.localeCompare(second.grupoMuscularNome, 'pt-BR')

      if (groupCompare !== 0) {
        return groupCompare
      }

      const firstLabel = first.nome ?? first.descricao
      const secondLabel = second.nome ?? second.descricao
      return firstLabel.localeCompare(secondLabel, 'pt-BR')
    })
}

function validateExercisePayload(payload: NovoExercicioPayload) {
  const name = payload.nome.trim()
  const description = payload.descricao.trim()
  const videoUrl = (payload.videoInstrucaoUrl ?? '').trim()

  if (!name) {
    throw new Error('Informe o nome do exercício.')
  }

  if (!description) {
    throw new Error('Informe a descrição do exercício.')
  }

  if (!payload.grupoMuscularId || !payload.grupoMuscularNome) {
    throw new Error('Selecione um grupo muscular.')
  }

  if (videoUrl) {
    try {
      new URL(videoUrl)
    } catch {
      throw new Error('Informe um link de vídeo válido (ex.: https://youtube.com/...).')
    }
  }

  return {
    nome: name,
    descricao: description,
    videoInstrucaoUrl: videoUrl,
  }
}

export async function createExercise(payload: NovoExercicioPayload) {
  const validated = validateExercisePayload(payload)

  await addDoc(exercisesCollection, {
    nome: validated.nome,
    descricao: validated.descricao,
    grupoMuscularId: payload.grupoMuscularId,
    grupoMuscularNome: payload.grupoMuscularNome,
    videoInstrucaoUrl: validated.videoInstrucaoUrl,
    criadoPorId: payload.criadoPorId ?? '',
    criadoPorNome: payload.criadoPorNome ?? '',
    criadoEm: serverTimestamp(),
  })
}

export async function updateExercise(exerciseId: string, payload: NovoExercicioPayload) {
  const validated = validateExercisePayload(payload)

  await updateDoc(doc(db, 'exercicios', exerciseId), {
    nome: validated.nome,
    descricao: validated.descricao,
    grupoMuscularId: payload.grupoMuscularId,
    grupoMuscularNome: payload.grupoMuscularNome,
    videoInstrucaoUrl: validated.videoInstrucaoUrl,
    criadoPorId: payload.criadoPorId ?? '',
    criadoPorNome: payload.criadoPorNome ?? '',
    atualizadoEm: serverTimestamp(),
  })
}
