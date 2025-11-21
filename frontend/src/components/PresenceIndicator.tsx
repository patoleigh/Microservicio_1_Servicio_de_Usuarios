import { useEffect, useState } from 'react'
import { presenceService } from '../lib/api'

interface PresenceData {
  userId: string
  status: string
  lastSeen: string
}

export default function PresenceIndicator({ userId }: { userId: string }) {
  const [status, setStatus] = useState<string>('offline')

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const data = await presenceService.getPresence(userId)
        setStatus(data?.status || 'offline')
      } catch {
        setStatus('offline')
      }
    }

    fetchPresence()
    const interval = setInterval(fetchPresence, 30000) // Cada 30s
    return () => clearInterval(interval)
  }, [userId])

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors] || statusColors.offline}`} />
      <span className="text-sm capitalize">{status}</span>
    </div>
  )
}

export function PresenceStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await presenceService.getStats()
        setStats(data?.data || data)
      } catch (err) {
        console.error('Error fetching presence stats:', err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Cada minuto
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h3 className="font-semibold mb-2">👥 Usuarios Conectados</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Total:</span>
          <span className="font-bold ml-2">{stats.total || 0}</span>
        </div>
        <div>
          <span className="text-green-600">Online:</span>
          <span className="font-bold ml-2">{stats.online || 0}</span>
        </div>
        <div>
          <span className="text-gray-600">Offline:</span>
          <span className="font-bold ml-2">{stats.offline || 0}</span>
        </div>
      </div>
    </div>
  )
}
