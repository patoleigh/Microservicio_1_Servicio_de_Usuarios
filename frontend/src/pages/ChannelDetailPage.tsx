import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { channelsService, messagesService, moderationService } from '@/lib/api'
import { useAuth } from '@/auth/AuthContext'
import { ThreadsList } from '@/components/threads/ThreadsList'
import { CyberCard } from '@/components/ui/CyberCard'
import { CyberButton } from '@/components/ui/CyberButton'
import { TerminalInput } from '@/components/ui/TerminalInput'
import { MessageSquare, Send, AlertTriangle, Edit2, Trash2, Hash } from 'lucide-react'

type Message = {
  id?: string;
  _id?: string;
  content: string;
  author?: string;
  created_at?: string;
  type?: string;
}

export default function ChannelDetailPage() {
  const { id: channelId } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState<any>(null)
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [moderationWarning, setModerationWarning] = useState('')

  useEffect(() => {
    const loadChannel = async () => {
      if (!channelId) return
      try {
        const data = await channelsService.getChannel(channelId)
        setChannel(data)
      } catch (err) {
        console.error('Error loading channel:', err)
      }
    }
    loadChannel()
  }, [channelId])

  const loadMessages = async (threadId: string) => {
    try {
      const data = await messagesService.getMessages(threadId)
      setMessages(data?.messages || data?.data || (Array.isArray(data) ? data : []))
    } catch (err) {
      console.error('Error loading messages:', err)
      setMessages([])
    }
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !user || !channelId) return

    setModerationWarning('')

    try {
      const modCheck = await moderationService.checkMessage({
        message_id: crypto.randomUUID(),
        user_id: user.id,
        channel_id: channelId,
        content: newMessage
      })

      if (modCheck?.is_toxic) {
        setModerationWarning(`⚠️ Content detected as toxic (${(modCheck.toxicity_score * 100).toFixed(1)}%). Please review your message.`)
        return
      }
    } catch (err) {
      console.warn('Moderation check failed:', err)
    }

    try {
      await messagesService.sendMessage(selectedThread, {
        content: newMessage,
        author: user.username,
        type: 'text'
      })
      setNewMessage('')
      await loadMessages(selectedThread)
    } catch (err: any) {
      alert('Error sending message: ' + (err.message || 'Unknown error'))
    }
  }

  const deleteMsg = async (messageId: string) => {
    if (!selectedThread || !confirm('Delete message?')) return
    try {
      await messagesService.deleteMessage(selectedThread, messageId)
      await loadMessages(selectedThread)
    } catch (err: any) {
      alert('Error deleting: ' + (err.message || 'Error'))
    }
  }

  const startEdit = (msg: Message) => {
    setEditingMessageId(msg.id || msg._id || '')
    setEditContent(msg.content)
  }

  const saveEdit = async () => {
    if (!selectedThread || !editingMessageId) return
    try {
      await messagesService.updateMessage(selectedThread, editingMessageId, { content: editContent })
      setEditingMessageId(null)
      setEditContent('')
      await loadMessages(selectedThread)
    } catch (err: any) {
      alert('Error editing: ' + (err.message || 'Error'))
    }
  }

  return (
    <div className="space-y-6">
      {channel && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white mb-1 flex items-center gap-2">
              <Hash className="w-6 h-6 text-cyber-primary" />
              {channel.name}
            </h1>
            {channel.description && (
              <p className="text-gray-400 font-mono text-sm pl-8">
                {channel.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-primary border border-cyber-primary/30 px-3 py-1 rounded bg-cyber-primary/5">
            <span className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
            CHANNEL ACTIVE
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Threads */}
        <div className="lg:col-span-1">
          <CyberCard className="h-[calc(100vh-200px)] overflow-y-auto">
            {channelId && (
              <ThreadsList
                channelId={channelId}
                onSelectThread={(tid) => {
                  setSelectedThread(tid)
                  loadMessages(tid)
                }}
              />
            )}
          </CyberCard>
        </div>

        {/* Main - Messages */}
        <div className="lg:col-span-2">
          <CyberCard className="h-[calc(100vh-200px)] flex flex-col">
            <div className="flex-none border-b border-white/10 pb-4 mb-4">
              <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyber-secondary" />
                {selectedThread ? 'MESSAGES' : 'SELECT A THREAD'}
              </h2>
            </div>

            {selectedThread ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 font-mono py-8">
                      NO MESSAGES DETECTED
                    </div>
                  ) : (
                    messages.map((m: Message) => {
                      const msgId = m.id || m._id || ''
                      const isEditing = editingMessageId === msgId
                      const isAuthor = m.author === user?.username

                      return (
                        <div
                          key={msgId}
                          className={`p-4 rounded border ${isAuthor
                              ? 'bg-cyber-primary/5 border-cyber-primary/20 ml-8'
                              : 'bg-white/5 border-white/10 mr-8'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-sm font-bold ${isAuthor ? 'text-cyber-primary' : 'text-cyber-secondary'}`}>
                                {m.author || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                              </span>
                            </div>
                            {isAuthor && !isEditing && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(m)} className="text-cyber-primary hover:text-white transition-colors">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => deleteMsg(msgId)} className="text-cyber-danger hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-black/50 border border-cyber-primary/50 rounded p-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyber-primary"
                              />
                              <div className="flex justify-end gap-2">
                                <CyberButton size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>
                                  CANCEL
                                </CyberButton>
                                <CyberButton size="sm" onClick={saveEdit}>
                                  SAVE
                                </CyberButton>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                              {m.content}
                            </p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                {moderationWarning && (
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded mb-4 font-mono text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {moderationWarning}
                  </div>
                )}

                <form onSubmit={sendMessage} className="flex gap-2 flex-none">
                  <div className="flex-1">
                    <TerminalInput
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      required
                    />
                  </div>
                  <CyberButton type="submit" className="h-[50px]">
                    <Send className="w-4 h-4" />
                  </CyberButton>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono gap-4">
                <MessageSquare className="w-12 h-12 opacity-20" />
                <p>SELECT A THREAD TO VIEW MESSAGES</p>
              </div>
            )}
          </CyberCard>
        </div>
      </div>
    </div>
  )
}
