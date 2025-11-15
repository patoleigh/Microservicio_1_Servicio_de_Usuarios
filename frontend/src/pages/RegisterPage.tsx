import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/users/register', { username, email, password, full_name: fullName })
      nav('/login')
    } catch (err: any) {
      setError(err?.detail?.detail?.[0]?.msg || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h2>Registro</h2>
      <form onSubmit={submit}>
        <label>Usuario</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <label>Nombre completo</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Creando…' : 'Crear cuenta'}</button>
      </form>
      <p style={{ marginTop: 12 }}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  )
}
