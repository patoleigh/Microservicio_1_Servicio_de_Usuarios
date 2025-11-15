import { FormEvent, useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import { Link } from 'react-router-dom'

type Channel = {
  _id: string
  name: string
  owner_id: string
  channel_type?: string
}

export default function ChannelsPage() {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    try {
      const data = await api.get(`/channels/members/user/${user.id}`)
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
      await api.post('/channels/', {
        name,
        description,
        owner_id: user.id,
        users: [user.id]
      })
      setName('')
      setDescription('')
      await load()
    } catch (err: any) {
      setError(err?.detail?.detail?.[0]?.msg || 'No se pudo crear el canal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <TopBar />
      <div style={{ padding: 16, fontFamily: 'system-ui, Arial', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3>Mis canales</h3>
          <ul>
            {channels.map(c => (
              <li key={c._id}>
                <Link to={`/channels/${c._id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Crear canal</h3>
          <form onSubmit={create}>
            <label>Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
            <label>Descripción</label>
            <input value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
            {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
            <button disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Creando…' : 'Crear'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
