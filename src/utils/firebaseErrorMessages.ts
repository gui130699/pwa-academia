const firebaseMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'O e-mail informado é inválido.',
  'auth/missing-password': 'Informe sua senha para continuar.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/user-not-found': 'Nenhuma conta foi encontrada com esse e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/operation-not-allowed': 'Ative o método E-mail/Senha no Firebase Authentication para liberar login e cadastro.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente em instantes.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
}

export function getFirebaseErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação agora.',
) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return firebaseMessages[error.code] ?? fallback
  }

  return fallback
}
