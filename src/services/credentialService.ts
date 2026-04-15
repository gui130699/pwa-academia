export interface CredentialValidationResult {
  validada: boolean
  mensagem: string
}

export async function validateProfessorCredential(): Promise<CredentialValidationResult> {
  return {
    validada: false,
    mensagem:
      'Integração externa de validação da credencial profissional será adicionada em uma próxima etapa.',
  }
}
