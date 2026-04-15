export interface ChatContact {
  id: string
  nome: string
  email: string
  tipo: 'professor' | 'aluno' | 'amigo'
}

export interface ChatMessage {
  id: string
  remetenteId: string
  remetenteNome: string
  texto: string
  criadoEm?: unknown
}
