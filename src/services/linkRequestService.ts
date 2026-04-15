import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { VinculoNotificacao, VinculoStatus } from '../types/notification'
import type { UsuarioAluno, UsuarioProfessor } from '../types/user'

const usersCollection = collection(db, 'usuarios')
const notificationsCollection = collection(db, 'notificacoes')

export async function searchStudents(searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const snapshot = await getDocs(query(usersCollection, where('tipoConta', '==', 'aluno')))

  const students = snapshot.docs.map((currentDoc) => currentDoc.data() as UsuarioAluno)

  if (!normalizedSearch) {
    return students
  }

  return students.filter((student) => {
    return (
      student.nomeCompleto.toLowerCase().includes(normalizedSearch) ||
      student.email.toLowerCase().includes(normalizedSearch)
    )
  })
}

export async function getProfessorLinkRequests(professorId: string) {
  const snapshot = await getDocs(
    query(notificationsCollection, where('professorId', '==', professorId)),
  )

  return snapshot.docs.map((currentDoc) => ({
    id: currentDoc.id,
    ...(currentDoc.data() as Omit<VinculoNotificacao, 'id'>),
  }))
}

export async function sendProfessorLinkRequest(params: {
  professor: UsuarioProfessor
  student: UsuarioAluno
}) {
  const { professor, student } = params
  const notificationId = `${professor.uid}_${student.uid}`

  await setDoc(doc(db, 'notificacoes', notificationId), {
    tipo: 'vinculo_professor',
    alunoId: student.uid,
    alunoNome: student.nomeCompleto,
    alunoEmail: student.email,
    professorId: professor.uid,
    professorNome: professor.nomeCompleto,
    professorEmail: professor.email,
    status: 'pendente',
    criadoEm: serverTimestamp(),
  })
}

export async function getStudentNotifications(studentId: string) {
  const snapshot = await getDocs(
    query(notificationsCollection, where('alunoId', '==', studentId)),
  )

  return snapshot.docs.map((currentDoc) => ({
    id: currentDoc.id,
    ...(currentDoc.data() as Omit<VinculoNotificacao, 'id'>),
  }))
}

export async function respondToLinkRequest(params: {
  notificationId: string
  status: VinculoStatus
  studentId: string
  professorId: string
  professorNome: string
}) {
  const { notificationId, status, studentId, professorId, professorNome } = params

  await updateDoc(doc(db, 'notificacoes', notificationId), {
    status,
    respondidoEm: serverTimestamp(),
  })

  if (status === 'aceito') {
    await setDoc(
      doc(db, 'usuarios', studentId),
      {
        professorVinculadoId: professorId,
        professorVinculadoNome: professorNome,
      },
      { merge: true },
    )
  }
}
