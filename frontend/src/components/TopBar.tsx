import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export default function TopBar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const onLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 12, borderBottom: '1px solid #ddd' }}>
      <strong>Student Messaging</strong>
      <Link to="/">Inicio</Link>
      <Link to="/channels">Canales</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>{user.username}</span>
            <button onClick={onLogout}>Salir</button>
          </>
        ) : null}
      </div>
    </div>
  )
}
