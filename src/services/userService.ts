import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { RegisterFormData } from '../types/auth'
import type { UsuarioAluno, UsuarioPerfil, UsuarioProfessor } from '../types/user'
import { formatPhone } from '../utils/format'

export async function createUserProfile(
  uid: string,
  data: RegisterFormData,
  emailVerificado: boolean,
) {
  const baseData = {
    uid,
    tipoConta: data.tipoConta,
    nomeCompleto: data.nomeCompleto.trim(),
    telefone: formatPhone(data.telefone),
    dataNascimento: data.dataNascimento,
    email: data.email.trim().toLowerCase(),
    emailVerificado,
    statusAprovacao: 'pendente' as const,
    criadoEm: serverTimestamp(),
  }

  const payload: UsuarioPerfil =
    data.tipoConta === 'professor'
      ? ({
          ...baseData,
          tipoConta: 'professor',
          credencialProfissional: data.credencialProfissional.trim(),
          ufCredencial: data.ufCredencial.trim().toUpperCase(),
          credencialValidada: false,
        } as UsuarioProfessor)
      : ({
          ...baseData,
          tipoConta: 'aluno',
        } as UsuarioAluno)

  await setDoc(doc(db, 'usuarios', uid), payload)
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'usuarios', uid))

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as UsuarioPerfil
}

export async function syncEmailVerificationStatus(
  uid: string,
  emailVerificado: boolean,
) {
  if (!emailVerificado) {
    return
  }

  await setDoc(
    doc(db, 'usuarios', uid),
    {
      emailVerificado: true,
    },
    { merge: true },
  )
}
