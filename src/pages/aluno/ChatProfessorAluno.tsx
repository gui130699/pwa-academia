import { MessageCircleMore, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAlunoChatContacts, sendChatMessage, subscribeToMessages } from '../../services/chatService'
import type { ChatContact, ChatMessage } from '../../types/chat'
import { getFirebaseErrorMessage } from '../../utils/firebaseErrorMessages'

export function ChatProfessorAluno() {
  const { user, profile } = useAuth()
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function loadContacts() {
      if (!user) {
        return
      }

      try {
        const currentContacts = await getAlunoChatContacts(user.uid)
        setContacts(currentContacts)
        setSelectedContact(currentContacts[0] ?? null)
      } catch (error) {
        setFeedback(getFirebaseErrorMessage(error, 'Não foi possível carregar os contatos.'))
      }
    }

    void loadContacts()
  }, [user])

  useEffect(() => {
    if (!user || !selectedContact) {
      setMessages([])
      return
    }

    const unsubscribe = subscribeToMessages(user.uid, selectedContact, setMessages)
    return unsubscribe
  }, [selectedContact, user])

  async function handleSendMessage() {
    if (!user || !profile || !selectedContact || !text.trim()) {
      return
    }

    try {
      await sendChatMessage({
        currentUserId: user.uid,
        currentUserName: profile.nomeCompleto,
        contact: selectedContact,
        text,
      })
      setText('')
    } catch (error) {
      setFeedback(getFirebaseErrorMessage(error, 'Não foi possível enviar a mensagem.'))
    }
  }

  return (
    <section className="aluno-page fade-in-panel">
      <span className="eyebrow">Chat</span>
      <h2>Conversas</h2>
      <p>Selecione um professor ou amigo para abrir o bate-papo.</p>

      {feedback ? <div className="info-banner error-banner panel-feedback">{feedback}</div> : null}

      <div className="chat-shell">
        <aside className="chat-sidebar">
          {contacts.length === 0 ? (
            <p>Nenhum contato disponível no momento.</p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={`chat-contact ${selectedContact?.id === contact.id ? 'chat-contact--active' : ''}`.trim()}
                onClick={() => setSelectedContact(contact)}
              >
                <strong>{contact.nome}</strong>
                <span>{contact.tipo}</span>
              </button>
            ))
          )}
        </aside>

        <div className="chat-panel">
          {selectedContact ? (
            <>
              <header className="chat-panel__header">
                <MessageCircleMore size={18} />
                <div>
                  <strong>{selectedContact.nome}</strong>
                  <span>{selectedContact.email}</span>
                </div>
              </header>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="muted-text">Nenhuma mensagem ainda. Comece a conversa.</p>
                ) : (
                  messages.map((message) => (
                    <article
                      key={message.id}
                      className={`chat-bubble ${message.remetenteId === user?.uid ? 'chat-bubble--own' : ''}`.trim()}
                    >
                      <strong>{message.remetenteNome}</strong>
                      <span>{message.texto}</span>
                      {message.criadoEm ? (
                        <time className="chat-bubble__time">
                          {new Date((message.criadoEm as { seconds: number }).seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      ) : null}
                    </article>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-compose">
                <input
                  className="search-panel__input"
                  type="text"
                  placeholder="Digite sua mensagem"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') void handleSendMessage() }}
                />
                <button className="btn btn-primary request-card__button" type="button" onClick={handleSendMessage}>
                  <Send size={16} />
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <p className="muted-text">Selecione um contato para começar a conversar.</p>
          )}
        </div>
      </div>
    </section>
  )
}
