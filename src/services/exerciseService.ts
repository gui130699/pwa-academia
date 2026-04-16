import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
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
    .sort((first, second) => first.descricao.localeCompare(second.descricao, 'pt-BR'))
}

export async function createExercise(payload: NovoExercicioPayload) {
  const description = payload.descricao.trim()
  const videoUrl = payload.videoInstrucaoUrl.trim()

  if (!description) {
    throw new Error('Informe a descrição do exercício.')
  }

  if (!payload.grupoMuscularId || !payload.grupoMuscularNome) {
    throw new Error('Selecione um grupo muscular.')
  }

  if (!videoUrl) {
    throw new Error('Informe o link do vídeo de instrução.')
  }

  try {
    new URL(videoUrl)
  } catch {
    throw new Error('Informe um link de vídeo válido.')
  }

  await addDoc(exercisesCollection, {
    descricao: description,
    grupoMuscularId: payload.grupoMuscularId,
    grupoMuscularNome: payload.grupoMuscularNome,
    videoInstrucaoUrl: videoUrl,
    criadoPorId: payload.criadoPorId ?? '',
    criadoPorNome: payload.criadoPorNome ?? '',
    criadoEm: serverTimestamp(),
  })
}
