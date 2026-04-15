import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/config'

const actionCodeSettings = {
  url: `${window.location.origin}/login`,
  handleCodeInApp: false,
}

export const authService = {
  async register(email: string, password: string) {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    )

    await sendEmailVerification(credentials.user, actionCodeSettings)
    return credentials.user
  },

  async login(email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    )

    return credentials.user
  },

  async logout() {
    await signOut(auth)
  },

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(
      auth,
      email.trim().toLowerCase(),
      actionCodeSettings,
    )
  },

  async resendVerificationEmail() {
    if (!auth.currentUser) {
      throw new Error('Nenhum usuário autenticado para reenviar verificação.')
    }

    await sendEmailVerification(auth.currentUser, actionCodeSettings)
  },
}
