import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase/config'
import { useAuth } from './useAuth'

interface ConversaDoc {
  id: string
  lastSenderId?: string
  updatedAt?: { seconds: number }
}

function getLastSeen(conversationId: string): number {
  return Number(localStorage.getItem(`chat_seen_${conversationId}`) ?? 0)
}

export function markConversationSeen(conversationId: string) {
  localStorage.setItem(`chat_seen_${conversationId}`, String(Date.now()))
  window.dispatchEvent(new CustomEvent('chat-seen-update'))
}

export function useUnreadCount() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversaDoc[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setConversations([])
      return
    }

    const q = query(collection(db, 'conversas'), where('participantIds', 'array-contains', user.uid))

    return onSnapshot(q, (snapshot) => {
      setConversations(
        snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ConversaDoc, 'id'>) })),
      )
    })
  }, [user])

  useEffect(() => {
    function handler() {
      setTick((t) => t + 1)
    }
    window.addEventListener('chat-seen-update', handler)
    return () => window.removeEventListener('chat-seen-update', handler)
  }, [])

  return useMemo(() => {
    if (!user) return 0

    return conversations.filter((conv) => {
      const lastSeen = getLastSeen(conv.id)
      const updatedAt = conv.updatedAt?.seconds ? conv.updatedAt.seconds * 1000 : 0
      return conv.lastSenderId && conv.lastSenderId !== user.uid && updatedAt > lastSeen
    }).length
  }, [conversations, user, tick])
}
