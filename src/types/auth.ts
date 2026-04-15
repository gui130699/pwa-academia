import type { User } from 'firebase/auth'
import type { TipoConta, UsuarioPerfil } from './user'

export type AccessStatus =
  | 'loading'
  | 'logged-out'
  | 'verify-email'
  | 'pending-approval'
  | 'approved'

export interface RegisterFormData {
  tipoConta: TipoConta
  nomeCompleto: string
  telefone: string
  dataNascimento: string
  email: string
  senha: string
  confirmarSenha: string
  credencialProfissional: string
  ufCredencial: string
}

export interface LoginFormData {
  email: string
  senha: string
}

export interface AuthContextData {
  user: User | null
  profile: UsuarioPerfil | null
  isLoading: boolean
  accessStatus: AccessStatus
  signUp: (data: RegisterFormData) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  sendResetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  refreshProfile: () => Promise<void>
}
