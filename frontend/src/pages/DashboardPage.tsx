import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { CyberCard } from '../components/ui/CyberCard'
import { Users, UserCheck, UserX, Radio, Hash, Server } from 'lucide-react'
import { presenceService, channelsService } from '../lib/api'
import { ThreadsList } from '../components/threads/ThreadsList'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeChannels: 0,
    totalUsers: 0,
    connectedUsers: 0,
    disconnectedUsers: 0
  })
  const [firstChannelId, setFirstChannelId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        // Fetch Presence Stats
        const presenceResponse = await presenceService.getStats()
        const presenceData = presenceResponse?.data || presenceResponse
        
        // Fetch User Channels
        const channels = await channelsService.getMyChannels(user.id)

        setStats({
          totalUsers: presenceData?.total || 0,
          connectedUsers: presenceData?.online || 0,
          disconnectedUsers: presenceData?.offline || 0,
          activeChannels: channels?.length || 0
        })

        if (channels && channels.length > 0) {
          setFirstChannelId(channels[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchData()
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  const statCards = [
    { label: 'Active Channels', value: stats.activeChannels.toString(), icon: Radio, color: 'text-cyber-primary' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'text-cyber-secondary' },
    { label: 'Connected Users', value: stats.connectedUsers.toString(), icon: UserCheck, color: 'text-green-400' },
    { label: 'Disconnected Users', value: stats.disconnectedUsers.toString(), icon: UserX, color: 'text-gray-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white mb-1">
            COMMAND CENTER
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Welcome back, <span className="text-cyber-primary">{user?.username}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-primary border border-cyber-primary/30 px-3 py-1 rounded bg-cyber-primary/5">
          <span className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse" />
          SYSTEM ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <CyberCard key={index} hover className="group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold font-mono text-white group-hover:text-cyber-primary transition-colors">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-2 rounded bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CyberCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CyberCard className="min-h-[400px]">
            {firstChannelId ? (
              <ThreadsList channelId={firstChannelId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono gap-4">
                <Hash className="w-12 h-12 opacity-20" />
                <p>NO CHANNELS DETECTED</p>
                <p className="text-xs">Join or create a channel to view threads.</p>
              </div>
            )}
          </CyberCard>
        </div>

        <div className="lg:col-span-1">
          <CyberCard className="min-h-[400px]">
            <h3 className="text-lg font-mono font-bold text-white mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyber-secondary" />
              System Status
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between text-gray-400">
                <span>CPU Core 0</span>
                <span className="text-cyber-primary">OK</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-primary h-full w-[45%]" />
              </div>

              <div className="flex justify-between text-gray-400 mt-4">
                <span>Memory Allocation</span>
                <span className="text-cyber-warning">WARN</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-warning h-full w-[75%]" />
              </div>

              <div className="flex justify-between text-gray-400 mt-4">
                <span>Network Latency</span>
                <span className="text-cyber-primary">24ms</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-primary h-full w-[15%]" />
              </div>

              <div className="mt-8 p-4 border border-cyber-primary/20 rounded bg-cyber-primary/5">
                <h4 className="text-cyber-primary font-bold mb-2">SYSTEM LOGS</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>&gt; Initializing protocols...</p>
                  <p>&gt; Connection established.</p>
                  <p>&gt; Threads service: <span className="text-green-400">ONLINE</span></p>
                  <p>&gt; Gateway: <span className="text-green-400">STABLE</span></p>
                </div>
              </div>
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  )
}
