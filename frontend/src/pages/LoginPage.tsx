import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { CyberCard } from '../components/ui/CyberCard'
import { CyberButton } from '../components/ui/CyberButton'
import { TerminalInput } from '../components/ui/TerminalInput'
import { motion } from 'framer-motion'
import { Terminal, ShieldCheck, AlertTriangle } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials. Access denied.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden p-4">
      <div className="scanline-overlay" />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <CyberCard className="border-cyber-primary/30">
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-cyber-primary/10 rounded-full flex items-center justify-center border border-cyber-primary/50 relative">
                <Terminal className="w-8 h-8 text-cyber-primary" />
                <div className="absolute inset-0 border border-cyber-primary rounded-full animate-ping opacity-20" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-mono font-bold text-white mb-2 tracking-tighter">
              SYSTEM <span className="text-cyber-primary">ACCESS</span>
            </h1>
            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
              Secure Connection Required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TerminalInput
              label="User Identity"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              required
            />

            <TerminalInput
              label="Access Code"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
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

            <CyberButton type="submit" className="w-full" size="lg">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Authenticate
              </span>
            </CyberButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs font-mono">
              New user?{' '}
              <Link to="/register" className="text-cyber-secondary hover:text-cyber-primary transition-colors underline decoration-dotted underline-offset-4">
                Initialize Protocol
              </Link>
            </p>
          </div>
        </CyberCard>
      </motion.div>
    </div>
  )
}
