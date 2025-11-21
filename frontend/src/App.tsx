import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChannelsPage from './pages/ChannelsPage'
import ChannelDetailPage from './pages/ChannelDetailPage'
import ChatbotsPage from './pages/ChatbotsPage'
import AppLayout from './components/layout/AppLayout'

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/channels"
          element={
            <Protected>
              <ChannelsPage />
            </Protected>
          }
        />
        <Route
          path="/channels/:id"
          element={
            <Protected>
              <ChannelDetailPage />
            </Protected>
          }
        />
        <Route
          path="/chatbots"
          element={
            <Protected>
              <ChatbotsPage />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
