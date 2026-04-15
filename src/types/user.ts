export type TipoConta = 'aluno' | 'professor'
export type StatusAprovacao = 'pendente' | 'aprovado' | 'reprovado'

export interface UsuarioBase {
  uid: string
  tipoConta: TipoConta
  nomeCompleto: string
  telefone: string
  dataNascimento: string
  email: string
  emailVerificado: boolean
  statusAprovacao: StatusAprovacao
  criadoEm?: unknown
}

export interface UsuarioAluno extends UsuarioBase {
  tipoConta: 'aluno'
}

export interface UsuarioProfessor extends UsuarioBase {
  tipoConta: 'professor'
  credencialProfissional: string
  ufCredencial: string
  credencialValidada: boolean
}

export type UsuarioPerfil = UsuarioAluno | UsuarioProfessor
