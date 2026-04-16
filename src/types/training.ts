export interface TreinoItem {
  id: string
  exerciseIds: string[]
  exerciseNames: string[]
  series?: string
  repeticoes: string
  repeticaoPersonalizada?: string
  repeticaoPersonalizadaValores?: string[]
  observacoes?: string
  carga?: string
  grupoMuscularId?: string
  grupoMuscularNome?: string
  mesclarExercicios: boolean
}

export interface TreinoMontado {
  id: string
  nome: string
  alunoId: string
  alunoNome: string
  professorId: string
  professorNome: string
  itens: TreinoItem[]
  criadoEm?: unknown
  atualizadoEm?: unknown
}

export interface NovoTreinoPayload {
  nome: string
  alunoId: string
  alunoNome: string
  professorId: string
  professorNome: string
  itens: TreinoItem[]
}
