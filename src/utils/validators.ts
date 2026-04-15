import type { RegisterFormData } from '../types/auth'
import { onlyDigits } from './format'

export const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export function isValidDateString(value: string) {
  if (!value) return false

  const date = new Date(`${value}T00:00:00`)
  const today = new Date()
  const minDate = new Date('1900-01-01T00:00:00')

  return !Number.isNaN(date.getTime()) && date >= minDate && date <= today
}

export function validateRegisterForm(data: RegisterFormData) {
  const errors: Partial<Record<keyof RegisterFormData, string>> = {}

  if (data.nomeCompleto.trim().length < 5 || !data.nomeCompleto.trim().includes(' ')) {
    errors.nomeCompleto = 'Informe nome completo.'
  }

  const phoneDigits = onlyDigits(data.telefone)
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.telefone = 'Informe um telefone válido com DDD.'
  }

  if (!isValidDateString(data.dataNascimento)) {
    errors.dataNascimento = 'Informe uma data de nascimento válida.'
  }

  if (!emailRegex.test(data.email.trim().toLowerCase())) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (data.senha.length < 6) {
    errors.senha = 'A senha deve ter no mínimo 6 caracteres.'
  }

  if (data.confirmarSenha !== data.senha) {
    errors.confirmarSenha = 'A confirmação precisa ser igual à senha.'
  }

  if (data.tipoConta === 'professor') {
    if (!data.credencialProfissional.trim()) {
      errors.credencialProfissional = 'Informe o número da credencial.'
    }

    if (!data.ufCredencial.trim()) {
      errors.ufCredencial = 'Selecione a UF da credencial.'
    }
  }

  return errors
}
