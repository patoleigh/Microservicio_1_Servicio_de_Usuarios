import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import { api } from '@/lib/api'
import { useAuth } from '@/auth/AuthContext'

type Thread = { id: string } | string
type Message = { id: string; content: string; author?: string; created_at?: string }

export default function ChannelDetailPage() {
  const { id: channelId } = useParams()
  const { user } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadCategory, setNewThreadCategory] = useState('general')
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  const loadThreads = async () => {
    if (!channelId) return
    const list = await api.get(`/channels/${channelId}/threads`)
    setThreads(Array.isArray(list) ? list : [])
  }

  const loadMessages = async (threadId: string) => {
    const list = await api.get(`/messages/threads/${threadId}`)
    setMessages(Array.isArray(list) ? list : [])
  }

  useEffect(() => {
    loadThreads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId])

  const createThread = async (e: FormEvent) => {
    e.preventDefault()
    if (!channelId || !user) return
    const thread_id = crypto.randomUUID()
    await api.post('/channels/threads', {
      channel_id: channelId,
      thread_id,
      title: newThreadTitle,
      author: user.id,
      category: newThreadCategory
    })
    setNewThreadTitle('')
    await loadThreads()
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !user) return
    await api.post(`/messages/threads/${selectedThread}`, {
      content: newMessage,
      author: user.username
    })
    setNewMessage('')
    await loadMessages(selectedThread)
  }

  return (
    <div>
      <TopBar />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, padding: 16, fontFamily: 'system-ui, Arial' }}>
        <div>
          <h3>Threads</h3>
          <ul>
            {threads.map((t: any) => {
              const tid = typeof t === 'string' ? t : t?.id || t?.thread_id || ''
              return (
                <li key={tid}>
                  <button onClick={() => { setSelectedThread(tid); loadMessages(tid) }}>
                    {tid}
                  </button>
                </li>
              )
            })}
          </ul>
          <form onSubmit={createThread} style={{ marginTop: 12 }}>
            <input placeholder="Título del thread" value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 6 }} />
            <select value={newThreadCategory} onChange={e => setNewThreadCategory(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 6 }}>
              <option value="general">General</option>
              <option value="anuncios">Anuncios</option>
              <option value="preguntas">Preguntas</option>
            </select>
            <button>Crear Thread</button>
          </form>
        </div>
        <div>
          <h3>Mensajes {selectedThread ? `(thread ${selectedThread})` : ''}</h3>
          <div style={{ border: '1px solid #ddd', minHeight: 200, padding: 8 }}>
            {messages.length === 0 ? <p>Sin mensajes</p> : (
              messages.map((m: any) => (
                <div key={m.id || m._id} style={{ padding: '6px 4px', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{m.author || 'anon'} • {m.created_at || ''}</div>
                  <div>{m.content}</div>
                </div>
              ))
            )}
          </div>
          {selectedThread && (
            <form onSubmit={sendMessage} style={{ marginTop: 8 }}>
              <input placeholder="Escribe un mensaje" value={newMessage} onChange={e => setNewMessage(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 6 }} />
              <button>Enviar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
