import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { ChatContact, ChatMessage } from '../types/chat'
import type { Amizade, VinculoNotificacao } from '../types/notification'
import type { UsuarioAluno, UsuarioProfessor } from '../types/user'

function getConversationId(firstId: string, secondId: string) {
  return [firstId, secondId].sort().join('_')
}

export async function getAlunoChatContacts(userId: string) {
  const contacts: ChatContact[] = []
  const userSnapshot = await getDoc(doc(db, 'usuarios', userId))

  if (!userSnapshot.exists()) {
    return contacts
  }

  const userData = userSnapshot.data() as UsuarioAluno

  if (userData.professorVinculadoId) {
    const professorSnapshot = await getDoc(doc(db, 'usuarios', userData.professorVinculadoId))

    if (professorSnapshot.exists()) {
      const professor = professorSnapshot.data() as UsuarioProfessor
      contacts.push({
        id: professor.uid,
        nome: professor.nomeCompleto,
        email: professor.email,
        tipo: 'professor',
      })
    }
  }

  const friendshipSnapshot = await getDocs(
    query(collection(db, 'amizades'), where('participantIds', 'array-contains', userId)),
  )
  friendshipSnapshot.docs.forEach((currentDoc) => {
    const friendship = currentDoc.data() as Amizade

    if (friendship.status !== 'aceito' || !friendship.participantIds.includes(userId)) {
      return
    }

    if (friendship.userAId === userId) {
      contacts.push({
        id: friendship.userBId,
        nome: friendship.userBNome,
        email: friendship.userBEmail,
        tipo: 'amigo',
      })
      return
    }

    contacts.push({
      id: friendship.userAId,
      nome: friendship.userANome,
      email: friendship.userAEmail,
      tipo: 'amigo',
    })
  })

  return contacts
}

export async function getProfessorChatContacts(userId: string) {
  const snapshot = await getDocs(
    query(
      collection(db, 'notificacoes'),
      where('professorId', '==', userId),
    ),
  )
  const contacts: ChatContact[] = []

  snapshot.docs.forEach((currentDoc) => {
    const data = currentDoc.data() as VinculoNotificacao
    if (data.tipo === 'vinculo_professor' && data.status === 'aceito') {
      contacts.push({
        id: data.alunoId,
        nome: data.alunoNome,
        email: data.alunoEmail,
        tipo: 'aluno',
      })
    }
  })

  return contacts
}

export function subscribeToMessages(currentUserId: string, contact: ChatContact, onChange: (messages: ChatMessage[]) => void) {
  const conversationId = getConversationId(currentUserId, contact.id)
  const messagesQuery = query(
    collection(db, 'conversas', conversationId, 'mensagens'),
    orderBy('criadoEm', 'asc'),
  )

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((currentDoc) => ({
      id: currentDoc.id,
      ...(currentDoc.data() as Omit<ChatMessage, 'id'>),
    }))

    onChange(messages)
  })
}

export async function sendChatMessage(params: {
  currentUserId: string
  currentUserName: string
  contact: ChatContact
  text: string
}) {
  const { currentUserId, currentUserName, contact, text } = params
  const conversationId = getConversationId(currentUserId, contact.id)

  await setDoc(
    doc(db, 'conversas', conversationId),
    {
      participantIds: [currentUserId, contact.id],
      participantNames: [currentUserName, contact.nome],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await addDoc(collection(db, 'conversas', conversationId, 'mensagens'), {
    remetenteId: currentUserId,
    remetenteNome: currentUserName,
    texto: text.trim(),
    criadoEm: serverTimestamp(),
  })
}
