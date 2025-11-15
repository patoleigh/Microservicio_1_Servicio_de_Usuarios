import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/auth/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { setToken, setUser } = useAuth()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/users/login', {
        username_or_email: usernameOrEmail,
        password
      })
      if (res?.access_token) setToken(res.access_token)
      const me = await api.get('/users/me')
      setUser(me)
      // Update presence to online
      await api.post('/presence/', { userId: me.id, status: 'online', device: 'web' })
      nav('/')
    } catch (err: any) {
      setError(err?.detail?.detail?.[0]?.msg || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit}>
        <label>Usuario o Email</label>
        <input value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
      <p style={{ marginTop: 12 }}>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  )
}
