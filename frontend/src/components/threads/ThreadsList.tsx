import { useState, useEffect } from 'react'
import { channelsService } from '../../lib/api'
import { CyberCard } from '../ui/CyberCard'
import { CyberButton } from '../ui/CyberButton'
import { TerminalInput } from '../ui/TerminalInput'
import { MessageSquare, Plus, Trash2, Hash } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

interface Thread {
    id: string
    title: string
    content: string
    author_id: string
    created_at: string
}

interface ThreadsListProps {
    channelId: string
    onSelectThread?: (threadId: string) => void
}

export function ThreadsList({ channelId, onSelectThread }: ThreadsListProps) {
    const [threads, setThreads] = useState<Thread[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newThreadTitle, setNewThreadTitle] = useState('')
    const [newThreadContent, setNewThreadContent] = useState('')
    const { user } = useAuth()

    const fetchThreads = async () => {
        try {
            setLoading(true)
            const data = await channelsService.getThreads(channelId)
            setThreads(data || [])
        } catch (error) {
            console.error('Failed to fetch threads:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (channelId) {
            fetchThreads()
        }
    }, [channelId])

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        try {
            await channelsService.createThread({
                title: newThreadTitle,
                content: newThreadContent,
                channel_id: channelId,
                author_id: user.id
            })
            setNewThreadTitle('')
            setNewThreadContent('')
            setShowCreate(false)
            fetchThreads()
        } catch (error) {
            console.error('Failed to create thread:', error)
        }
    }

    const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this thread?')) return
        try {
            await channelsService.deleteThread(threadId)
            fetchThreads()
        } catch (error) {
            console.error('Failed to delete thread:', error)
            alert('Failed to delete thread')
        }
    }

    if (loading) {
        return <div className="text-cyber-primary font-mono animate-pulse">LOADING THREADS...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl text-white font-mono font-bold flex items-center gap-2">
                    <Hash className="w-5 h-5 text-cyber-secondary" />
                    THREADS
                </h3>
                <CyberButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreate(!showCreate)}
                >
                    <Plus className="w-4 h-4" />
                    NEW THREAD
                </CyberButton>
            </div>

            {showCreate && (
                <CyberCard className="border-cyber-primary/50">
                    <form onSubmit={handleCreateThread} className="space-y-4">
                        <TerminalInput
                            label="THREAD TITLE"
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                            placeholder="Enter thread title..."
                            required
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-cyber-primary uppercase">Initial Message</label>
                            <textarea
                                className="w-full bg-cyber-black border border-cyber-gray text-white font-mono p-3 focus:border-cyber-primary focus:outline-none focus:ring-1 focus:ring-cyber-primary resize-none h-24 rounded"
                                value={newThreadContent}
                                onChange={(e) => setNewThreadContent(e.target.value)}
                                placeholder="Start the conversation..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <CyberButton variant="ghost" size="sm" onClick={() => setShowCreate(false)} type="button">
                                CANCEL
                            </CyberButton>
                            <CyberButton variant="primary" size="sm" type="submit" glitch>
                                CREATE
                            </CyberButton>
                        </div>
                    </form>
                </CyberCard>
            )}

            <div className="grid gap-4">
                {threads.length === 0 ? (
                    <div className="text-gray-500 font-mono text-center py-8">
                        NO THREADS FOUND IN THIS SECTOR.
                    </div>
                ) : (
                    threads.map((thread) => (
                        <CyberCard
                            key={thread.id}
                            hover
                            className="group cursor-pointer relative"
                            onClick={() => onSelectThread?.(thread.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-white group-hover:text-cyber-primary transition-colors">
                                        {thread.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm line-clamp-2 font-mono">
                                        {thread.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-mono">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Open
                                        </span>
                                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {user?.id === thread.author_id && (
                                    <button
                                        onClick={(e) => handleDeleteThread(e, thread.id)}
                                        className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                        title="Delete Thread"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </CyberCard>
                    ))
                )}
            </div>
        </div>
    )
}
