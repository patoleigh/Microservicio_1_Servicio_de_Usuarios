import { useState } from 'react'
import { searchService } from '../lib/api'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'messages' | 'files' | 'channels' | 'threads'>('messages')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError('')
    try {
      let data
      switch (searchType) {
        case 'messages':
          data = await searchService.searchMessages(query)
          break
        case 'files':
          data = await searchService.searchFiles(query)
          break
        case 'channels':
          data = await searchService.searchChannels(query)
          break
        case 'threads':
          data = await searchService.searchThreadsByKeyword(query)
          break
      }
      setResults(data?.results || data?.data || data || [])
    } catch (err: any) {
      setError(err.message || 'Error en búsqueda')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">🔍 Búsqueda Global</h2>
      
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar..."
          className="flex-1 border rounded px-4 py-2"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="border rounded px-4 py-2"
        >
          <option value="messages">Mensajes</option>
          <option value="files">Archivos</option>
          <option value="channels">Canales</option>
          <option value="threads">Hilos</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {results.length === 0 && !loading && query && (
          <p className="text-gray-500">No se encontraron resultados</p>
        )}
        {results.map((item, idx) => (
          <div key={idx} className="border p-4 rounded hover:bg-gray-50">
            {searchType === 'messages' && (
              <>
                <p className="font-semibold">{item.author || 'Anónimo'}</p>
                <p className="text-sm text-gray-600">{item.content}</p>
                <p className="text-xs text-gray-400 mt-1">Thread: {item.thread_id}</p>
              </>
            )}
            {searchType === 'channels' && (
              <>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </>
            )}
            {searchType === 'threads' && (
              <>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">{item.content}</p>
              </>
            )}
            {searchType === 'files' && (
              <>
                <p className="font-semibold">{item.filename || item.name}</p>
                <p className="text-xs text-gray-400">{item.content_type} - {item.size} bytes</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
