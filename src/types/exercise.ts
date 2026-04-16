export interface GrupoMuscular {
  id: string
  nome: string
  criadoEm?: unknown
}

export interface Exercicio {
  id: string
  descricao: string
  grupoMuscularId: string
  grupoMuscularNome: string
  videoInstrucaoUrl: string
  criadoPorId?: string
  criadoPorNome?: string
  criadoEm?: unknown
}

export interface NovoExercicioPayload {
  descricao: string
  grupoMuscularId: string
  grupoMuscularNome: string
  videoInstrucaoUrl: string
  criadoPorId?: string
  criadoPorNome?: string
}
