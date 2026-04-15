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
import type {
  Amizade,
  AppNotificacao,
  VinculoNotificacao,
  VinculoStatus,
} from '../types/notification'
import type { UsuarioAluno, UsuarioProfessor } from '../types/user'

const usersCollection = collection(db, 'usuarios')
const notificationsCollection = collection(db, 'notificacoes')
const friendshipsCollection = collection(db, 'amizades')

function normalizeSearch(searchTerm: string) {
  return searchTerm.trim().toLowerCase()
}

export async function searchStudents(searchTerm: string) {
  const normalizedSearch = normalizeSearch(searchTerm)
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

export async function searchStudentFriends(searchTerm: string, currentUserId: string) {
  const students = await searchStudents(searchTerm)
  return students.filter((student) => student.uid !== currentUserId)
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

export async function sendFriendRequest(params: {
  fromAluno: UsuarioAluno
  toAluno: UsuarioAluno
}) {
  const { fromAluno, toAluno } = params
  const notificationId = ['amizade', fromAluno.uid, toAluno.uid].join('_')

  await setDoc(doc(db, 'notificacoes', notificationId), {
    tipo: 'amizade_aluno',
    remetenteId: fromAluno.uid,
    remetenteNome: fromAluno.nomeCompleto,
    remetenteEmail: fromAluno.email,
    destinatarioId: toAluno.uid,
    destinatarioNome: toAluno.nomeCompleto,
    destinatarioEmail: toAluno.email,
    status: 'pendente',
    criadoEm: serverTimestamp(),
  })
}

export async function getStudentNotifications(studentId: string): Promise<AppNotificacao[]> {
  const [linkSnapshot, receivedSnapshot, sentSnapshot] = await Promise.all([
    getDocs(query(notificationsCollection, where('alunoId', '==', studentId))),
    getDocs(query(notificationsCollection, where('destinatarioId', '==', studentId))),
    getDocs(query(notificationsCollection, where('remetenteId', '==', studentId))),
  ])

  const allDocs = [...linkSnapshot.docs, ...receivedSnapshot.docs, ...sentSnapshot.docs]
  const uniqueDocs = Array.from(new Map(allDocs.map((currentDoc) => [currentDoc.id, currentDoc])).values())

  return uniqueDocs.map(
    (currentDoc) =>
      ({
        id: currentDoc.id,
        ...(currentDoc.data() as Omit<AppNotificacao, 'id'>),
      }) as AppNotificacao,
  )
}

export async function getStudentFriendships(studentId: string) {
  const snapshot = await getDocs(
    query(friendshipsCollection, where('participantIds', 'array-contains', studentId)),
  )

  return snapshot.docs.map((currentDoc) => ({
    id: currentDoc.id,
    ...(currentDoc.data() as Omit<Amizade, 'id'>),
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

export async function respondToFriendRequest(params: {
  notificationId: string
  status: VinculoStatus
  remetenteId: string
  remetenteNome: string
  remetenteEmail: string
  destinatarioId: string
  destinatarioNome: string
  destinatarioEmail: string
}) {
  const {
    notificationId,
    status,
    remetenteId,
    remetenteNome,
    remetenteEmail,
    destinatarioId,
    destinatarioNome,
    destinatarioEmail,
  } = params

  await updateDoc(doc(db, 'notificacoes', notificationId), {
    status,
    respondidoEm: serverTimestamp(),
  })

  if (status === 'aceito') {
    const [userAId, userBId] = [remetenteId, destinatarioId].sort()
    const isSenderFirst = userAId === remetenteId

    await setDoc(doc(db, 'amizades', `${userAId}_${userBId}`), {
      participantIds: [remetenteId, destinatarioId],
      userAId,
      userANome: isSenderFirst ? remetenteNome : destinatarioNome,
      userAEmail: isSenderFirst ? remetenteEmail : destinatarioEmail,
      userBId,
      userBNome: isSenderFirst ? destinatarioNome : remetenteNome,
      userBEmail: isSenderFirst ? destinatarioEmail : remetenteEmail,
      status: 'aceito',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    })
  }
}
