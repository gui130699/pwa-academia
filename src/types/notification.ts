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
