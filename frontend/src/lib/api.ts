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
    } catch {}
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
  }
}
