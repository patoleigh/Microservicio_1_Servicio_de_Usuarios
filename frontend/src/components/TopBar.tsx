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
    <header className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="container-page flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-blue-700">Student Messaging</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-700 hover:text-blue-700">Inicio</Link>
          <Link to="/channels" className="text-gray-700 hover:text-blue-700">Canales</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="text-sm text-gray-700">{user.username}</span>}
          {user && (
            <button onClick={onLogout} className="btn-primary">Salir</button>
          )}
        </div>
      </div>
    </header>
  )
}
