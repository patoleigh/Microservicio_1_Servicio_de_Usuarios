import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { channelsService, searchService } from '@/lib/api'
import { Link } from 'react-router-dom'
import { CyberCard } from '@/components/ui/CyberCard'
import { CyberButton } from '@/components/ui/CyberButton'
import { TerminalInput } from '@/components/ui/TerminalInput'
import { Hash, Plus, Search, Crown, Radio } from 'lucide-react'

type Channel = {
  _id: string
  name: string
  description?: string
  owner_id: string
  channel_type?: string
}

export default function ChannelsPage() {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const load = async () => {
    if (!user) return
    try {
      const data = await channelsService.getMyChannels(user.id)
      setChannels(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await channelsService.create({
        name,
        owner_id: user.id,
      })
      setName('')
      await load()
    } catch (err: any) {
      console.error('Create channel error:', err)
      const msg = err?.detail?.detail?.[0]?.msg || err?.detail?.[0]?.msg || err?.detail || 'Failed to create channel'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      const results = await searchService.searchChannels(searchQuery)
      setSearchResults(results?.results || results?.data || [])
    } catch (err) {
      console.error('Error searching channels:', err)
      setSearchResults([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-mono font-bold text-white flex items-center gap-3">
          <Radio className="w-8 h-8 text-cyber-primary animate-pulse" />
          CHANNELS_NET
        </h1>
        <div className="text-xs font-mono text-cyber-primary border border-cyber-primary/30 px-3 py-1 rounded bg-cyber-primary/5">
          NETWORK STATUS: ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Channels */}
        <CyberCard className="h-full">
          <h2 className="text-xl font-mono font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Hash className="w-5 h-5 text-cyber-secondary" />
            MY CHANNELS
          </h2>
          {channels.length === 0 ? (
            <div className="text-gray-500 font-mono text-center py-8">
              NO CHANNELS DETECTED. INITIATE NEW PROTOCOL.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {channels.map(c => (
                <Link key={c._id} to={`/channels/${c._id}`}>
                  <div className="group border border-white/10 rounded p-3 hover:border-cyber-primary/50 hover:bg-cyber-primary/5 transition-all cursor-pointer mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white font-mono group-hover:text-cyber-primary transition-colors">
                          #{c.name}
                        </h3>
                        {c.description && (
                          <p className="text-sm text-gray-400 font-mono line-clamp-1 mt-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                      {c.owner_id === user?.id && (
                        <span className="text-xs text-cyber-secondary font-mono flex items-center gap-1 bg-cyber-secondary/10 px-2 py-0.5 rounded border border-cyber-secondary/30">
                          <Crown className="w-3 h-3" /> OWNER
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CyberCard>

        {/* Create Channel */}
        <CyberCard>
          <h2 className="text-xl font-mono font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Plus className="w-5 h-5 text-cyber-primary" />
            INITIATE NEW CHANNEL
          </h2>
          <form onSubmit={create} className="space-y-4">
            <TerminalInput
              label="CHANNEL DESIGNATION"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. operations-alpha"
            />
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded text-sm font-mono">
                ERROR: {error}
              </div>
            )}
            <CyberButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              glitch
            >
              {loading ? 'INITIALIZING...' : 'CREATE CHANNEL'}
            </CyberButton>
          </form>
        </CyberCard>
      </div>

      {/* Search Channels */}
      <CyberCard>
        <h2 className="text-xl font-mono font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Search className="w-5 h-5 text-cyber-secondary" />
          GLOBAL SEARCH
        </h2>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <TerminalInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search frequency..."
            />
          </div>
          <CyberButton
            onClick={handleSearch}
            variant="secondary"
            className="h-[74px]" // Match input height roughly including label space
          >
            SEARCH
          </CyberButton>
        </div>
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((channel, idx) => (
              <Link key={idx} to={`/channels/${channel._id || channel.id}`}>
                <div className="border border-white/10 rounded p-3 hover:border-cyber-primary/50 hover:bg-cyber-primary/5 transition-all cursor-pointer h-full">
                  <h3 className="font-bold text-white font-mono text-cyber-primary">
                    #{channel.name}
                  </h3>
                  {channel.description && (
                    <p className="text-sm text-gray-400 font-mono line-clamp-2 mt-1">
                      {channel.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CyberCard>
    </div>
  )
}
