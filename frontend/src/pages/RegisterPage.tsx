import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { CyberCard } from '../components/ui/CyberCard'
import { CyberButton } from '../components/ui/CyberButton'
import { TerminalInput } from '../components/ui/TerminalInput'
import { motion } from 'framer-motion'
import { Terminal, UserPlus, AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/users/register', { username, email, password, full_name: fullName })
      navigate('/login')
    } catch (err: any) {
      setError(err?.detail?.detail?.[0]?.msg || 'Registration failed. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden p-4">
      <div className="scanline-overlay" />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyber-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <CyberCard className="border-cyber-secondary/30">
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-cyber-secondary/10 rounded-full flex items-center justify-center border border-cyber-secondary/50 relative">
                <Terminal className="w-8 h-8 text-cyber-secondary" />
                <div className="absolute inset-0 border border-cyber-secondary rounded-full animate-ping opacity-20" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-mono font-bold text-white mb-2 tracking-tighter">
              INIT <span className="text-cyber-secondary">PROTOCOL</span>
            </h1>
            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
              New User Registration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TerminalInput
              label="User Identity"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose username..."
              required
            />

            <TerminalInput
              label="Digital Contact"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email..."
              required
            />

            <TerminalInput
              label="Full Designation"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name (optional)..."
            />

            <TerminalInput
              label="Access Code"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose password..."
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-cyber-danger text-sm font-mono bg-cyber-danger/10 p-3 rounded border border-cyber-danger/20"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <CyberButton
              type="submit"
              className="w-full"
              size="lg"
              variant="secondary"
              disabled={loading}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {loading ? 'INITIALIZING...' : 'REGISTER IDENTITY'}
              </span>
            </CyberButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs font-mono">
              Already registered?{' '}
              <Link to="/login" className="text-cyber-primary hover:text-cyber-secondary transition-colors underline decoration-dotted underline-offset-4">
                Access System
              </Link>
            </p>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  )
}
