/// <reference types="vite/client" />
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apigateway.grupo1.inf326.nursoft.dev'

function buildHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {})
  }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  const rawUser = localStorage.getItem('user')
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser)
      if (u?.id) headers['X-User-Id'] = u.id
    } catch { }
  }
  return headers
}

async function handle(res: Response) {
  if (!res.ok) {
    let detail: any = undefined
    try {
      detail = await res.json()
    } catch {
      detail = await res.text()
    }
    const err = new Error('API Error') as any
    err.status = res.status
    err.detail = detail
    throw err
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: async (path: string, params?: Record<string, string | number>) => {
    const url = new URL(BASE_URL + path)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)))
    const res = await fetch(url, { headers: buildHeaders() })
    return handle(res)
  },
  post: async (path: string, body?: any, headers?: Record<string, string>) => {
    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: buildHeaders(headers),
      body: body ? JSON.stringify(body) : undefined
    })
    return handle(res)
  },
  put: async (path: string, body?: any) => {
    const res = await fetch(BASE_URL + path, {
      method: 'PUT',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })
    return handle(res)
  },
  patch: async (path: string, body?: any) => {
    const res = await fetch(BASE_URL + path, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })
    return handle(res)
  },
  delete: async (path: string, body?: any) => {
    const res = await fetch(BASE_URL + path, {
      method: 'DELETE',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })
    return handle(res)
  }
}

// Services wrappers
export const channelsService = {
  getMyChannels: (userId: string) => api.get(`/channels/members/user/${userId}`),
  create: (data: { name: string; owner_id: string }) => api.post('/channels/', data),
  getChannel: (channelId: string) => api.get(`/channels/${channelId}`),
  getMembers: (channelId: string) => api.get(`/channels/${channelId}/members`),
  addMember: (data: { user_id: string; channel_id: string; role?: string }) => api.post('/channels/members', data),
  removeMember: (data: { user_id: string; channel_id: string }) => api.delete('/channels/members'),
  getThreads: (channelId: string) => api.get(`/channels/${channelId}/threads`),
  createThread: (data: { title: string; content: string; channel_id: string; author_id: string }) => api.post('/channels/threads', data),
  deleteThread: (threadId: string) => api.delete('/channels/threads', { thread_id: threadId }),
}

export const messagesService = {
  getMessages: (threadId: string, limit = 50, cursor?: string) =>
    api.get(`/messages/threads/${threadId}`, cursor ? { limit, cursor } : { limit }),
  sendMessage: (threadId: string, data: { content: string; type?: string; author?: string }) =>
    api.post(`/messages/threads/${threadId}`, data),
  updateMessage: (threadId: string, messageId: string, data: { content: string }) =>
    api.put(`/messages/threads/${threadId}/messages/${messageId}`, data),
  deleteMessage: (threadId: string, messageId: string) =>
    api.delete(`/messages/threads/${threadId}/messages/${messageId}`),
}

export const searchService = {
  searchMessages: (q: string) => api.get('/search/messages', { q }),
  searchFiles: (q: string) => api.get('/search/files', { q }),
  searchChannels: (q: string) => api.get('/search/channels', { q }),
  searchThreadsByKeyword: (keyword: string) => api.get(`/search/threads/keyword/${keyword}`),
  searchThreadsByAuthor: (author: string) => api.get(`/search/threads/author/${author}`),
  searchThreadsByStatus: (status: string) => api.get(`/search/threads/status/${status}`),
  searchThreadsByDaterange: (start_date: string, end_date: string) => api.get('/search/threads/daterange', { start_date, end_date }),
}

export const moderationService = {
  checkMessage: (data: { message_id: string; user_id: string; channel_id: string; content: string }) =>
    api.post('/moderation/check', data),
  getUserStatus: (userId: string, channelId: string) =>
    api.get(`/moderation/status/${userId}/${channelId}`),
}

export const presenceService = {
  register: (data: { userId: string; device?: string }) => api.post('/presence/', data),
  update: (userId: string, data: { status?: string; heartbeat?: boolean }) =>
    api.patch(`/presence/${userId}`, data),
  getPresence: (userId: string) => api.get(`/presence/${userId}`),
  getStats: () => api.get('/presence/stats'),
  listAll: (status?: string) => api.get('/presence/', status ? { status } : {}),
}

export const chatbotService = {
  askWikipedia: async (question: string, language = 'es') => {
    const payload = { question, language }
    const candidates = [
      '/chatbots/wikipedia/query',
      '/chatbot/wikipedia/query',
      '/chatbots/wikipedia',
      '/chatbot/wikipedia',
      '/wikipedia/query'
    ]
    let lastError: any = null
    for (const path of candidates) {
      try {
        return await api.post(path, payload)
      } catch (e: any) {
        lastError = e
        if (e?.status !== 404) throw e
      }
    }
    throw lastError || new Error('Wikipedia chatbot endpoint not found')
  },
  askProgramming: async (question: string, context?: string) => {
    // Programming bot expects { message } according to its OpenAPI
    const payload: any = { message: question }
    if (context) payload.context = context
    const candidates = [
      '/chatbots/programming/chat', // preferred gateway path mapping to /chat
      '/chatbots/programming/query',
      '/chatbot/programming/query',
      '/chatbots/progra/query',
      '/chatbotprogra/query',
      '/programming/query',
      '/chatbots/prog/query'
    ]
    let lastError: any = null
    for (const path of candidates) {
      try {
        return await api.post(path, payload)
      } catch (e: any) {
        lastError = e
        if (e?.status !== 404) throw e
      }
    }
    throw lastError || new Error('Programming chatbot endpoint not found')
  },
  wikipediaHealth: () => api.get('/chatbots/wikipedia/health'),
  programmingHealth: () => api.get('/chatbots/programming/health'),
}
