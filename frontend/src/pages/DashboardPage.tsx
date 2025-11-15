import TopBar from '@/components/TopBar'
import { useAuth } from '@/auth/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <TopBar />
      <div style={{ padding: 16, fontFamily: 'system-ui, Arial' }}>
        <h2>Bienvenido</h2>
        {user && (
          <div>
            <p><b>Usuario:</b> {user.username}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Nombre:</b> {user.full_name || '-'}</p>
          </div>
        )}
        <p>Usa el menú superior para navegar por Canales.</p>
      </div>
    </div>
  )
}
