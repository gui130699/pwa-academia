export interface GrupoMuscular {
  id: string
  nome: string
  criadoEm?: unknown
}

export interface Exercicio {
  id: string
  nome?: string
  descricao: string
  grupoMuscularId: string
  grupoMuscularNome: string
  videoInstrucaoUrl?: string
  criadoPorId?: string
  criadoPorNome?: string
  criadoEm?: unknown
}

export interface NovoExercicioPayload {
  nome: string
  descricao: string
  grupoMuscularId: string
  grupoMuscularNome: string
  videoInstrucaoUrl?: string
  criadoPorId?: string
  criadoPorNome?: string
}
