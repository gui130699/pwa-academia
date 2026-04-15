import type { StatusAprovacao, TipoConta } from '../types/user'

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function getTipoContaLabel(tipoConta: TipoConta) {
  return tipoConta === 'professor' ? 'Professor' : 'Aluno'
}

export function getApprovalLabel(statusAprovacao: StatusAprovacao) {
  switch (statusAprovacao) {
    case 'aprovado':
      return 'Aprovado'
    case 'reprovado':
      return 'Reprovado'
    default:
      return 'Pendente'
  }
}

export function getUserInitials(nomeCompleto: string) {
  return (
    nomeCompleto
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') || 'UA'
  )
}
