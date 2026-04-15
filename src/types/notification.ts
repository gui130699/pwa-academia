export type VinculoStatus = 'pendente' | 'aceito' | 'recusado'

export interface VinculoNotificacao {
  id: string
  tipo: 'vinculo_professor'
  alunoId: string
  alunoNome: string
  alunoEmail: string
  professorId: string
  professorNome: string
  professorEmail: string
  status: VinculoStatus
  criadoEm?: unknown
  respondidoEm?: unknown
}

export interface AmizadeNotificacao {
  id: string
  tipo: 'amizade_aluno'
  remetenteId: string
  remetenteNome: string
  remetenteEmail: string
  destinatarioId: string
  destinatarioNome: string
  destinatarioEmail: string
  status: VinculoStatus
  criadoEm?: unknown
  respondidoEm?: unknown
}

export interface Amizade {
  id?: string
  participantIds: string[]
  userAId: string
  userANome: string
  userAEmail: string
  userBId: string
  userBNome: string
  userBEmail: string
  status: VinculoStatus
  criadoEm?: unknown
  atualizadoEm?: unknown
}

export type AppNotificacao = VinculoNotificacao | AmizadeNotificacao
