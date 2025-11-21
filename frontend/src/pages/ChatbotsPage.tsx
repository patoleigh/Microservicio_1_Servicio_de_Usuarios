import ChatbotPanel from '../components/ChatbotPanel'
import { CyberCard } from '../components/ui/CyberCard'
import { Bot } from 'lucide-react'

export default function ChatbotsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-cyber-primary" />
        <div>
          <h1 className="text-2xl font-mono font-bold text-white mb-1">
            AI ASSISTANTS
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Consulta con nuestros asistentes de Wikipedia y Programación
          </p>
        </div>
      </div>

      <CyberCard>
        <ChatbotPanel />
      </CyberCard>
    </div>
  )
}
