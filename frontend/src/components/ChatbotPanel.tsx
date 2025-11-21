import { useState } from 'react'
import { chatbotService } from '../lib/api'
import { BookOpen, Code, Zap, Activity } from 'lucide-react'

type BotType = 'wikipedia' | 'programming'

export default function ChatbotPanel() {
  const [botType, setBotType] = useState<BotType>('wikipedia')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('es')
  const [health, setHealth] = useState('')

  const handleAsk = async () => {
    if (!question.trim()) return

    setLoading(true)
    setAnswer('')
    try {
      let response
      if (botType === 'wikipedia') {
        response = await chatbotService.askWikipedia(question, language)
      } else {
        response = await chatbotService.askProgramming(question)
      }
      setAnswer(response?.answer || response?.response || JSON.stringify(response))
    } catch (err: any) {
      const detail = err?.detail ? (typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)) : ''
      const status = err?.status ? ` (HTTP ${err.status})` : ''
      setAnswer(`Error: ${err.message}${status}${detail ? `\nDetalle: ${detail}` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    setHealth('')
    try {
      const data = botType === 'wikipedia' ? await chatbotService.wikipediaHealth() : await chatbotService.programmingHealth()
      setHealth(JSON.stringify(data))
    } catch (err: any) {
      const status = err?.status ? `HTTP ${err.status}` : ''
      setHealth(`Error de salud ${status}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyber-primary" />
          Selecciona tu Asistente
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setBotType('wikipedia')}
            className={`p-4 rounded border-2 transition-all duration-200 font-mono group ${
              botType === 'wikipedia'
                ? 'border-cyber-primary bg-cyber-primary/10 text-white'
                : 'border-cyber-gray bg-cyber-dark/50 text-gray-400 hover:border-cyber-primary/50 hover:bg-cyber-primary/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={`w-6 h-6 ${botType === 'wikipedia' ? 'text-cyber-primary' : 'text-gray-500 group-hover:text-cyber-primary/70'}`} />
              <div className="text-left">
                <div className="font-bold">Wikipedia</div>
                <div className="text-xs opacity-70">Conocimiento general</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setBotType('programming')}
            className={`p-4 rounded border-2 transition-all duration-200 font-mono group ${
              botType === 'programming'
                ? 'border-cyber-secondary bg-cyber-secondary/10 text-white'
                : 'border-cyber-gray bg-cyber-dark/50 text-gray-400 hover:border-cyber-secondary/50 hover:bg-cyber-secondary/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Code className={`w-6 h-6 ${botType === 'programming' ? 'text-cyber-secondary' : 'text-gray-500 group-hover:text-cyber-secondary/70'}`} />
              <div className="text-left">
                <div className="font-bold">Programación</div>
                <div className="text-xs opacity-70">Ayuda con código</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {botType === 'wikipedia' && (
        <div className="space-y-2">
          <label className="block text-sm font-mono font-medium text-gray-400">
            IDIOMA / LANGUAGE:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-cyber-dark border border-cyber-gray rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-cyber-primary transition-colors"
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-mono font-medium text-gray-400">
          TU PREGUNTA:
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())}
          placeholder={botType === 'wikipedia' ? '¿Qué quieres saber?' : '¿Tienes una duda de programación?'}
          className="w-full bg-cyber-dark border border-cyber-gray rounded px-4 py-3 text-white font-mono h-32 resize-none focus:outline-none focus:border-cyber-primary transition-colors placeholder:text-gray-600"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAsk}
          disabled={loading}
          className={`flex-1 py-3 rounded font-mono font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : botType === 'wikipedia'
              ? 'bg-cyber-primary text-cyber-black hover:bg-cyber-primary/90 hover:shadow-lg hover:shadow-cyber-primary/30'
              : 'bg-cyber-secondary text-cyber-black hover:bg-cyber-secondary/90 hover:shadow-lg hover:shadow-cyber-secondary/30'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              CONSULTANDO...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              PREGUNTAR
            </>
          )}
        </button>
        <button
          type="button"
          onClick={checkHealth}
          className="px-6 py-3 rounded border-2 border-cyber-gray text-gray-400 hover:border-cyber-primary hover:text-cyber-primary transition-all duration-200 font-mono flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          HEALTH
        </button>
      </div>

      {answer && (
        <div className="p-6 bg-cyber-dark/50 rounded border-2 border-cyber-primary/30 backdrop-blur">
          <h3 className="font-mono font-bold text-cyber-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            RESPUESTA:
          </h3>
          <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-mono">
            {answer}
          </div>
        </div>
      )}

      {health && (
        <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Estado del servicio: {health}
        </div>
      )}
    </div>
  )
}
