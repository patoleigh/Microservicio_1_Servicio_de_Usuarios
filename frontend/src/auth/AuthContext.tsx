import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type User = {
  id: string
  email: string
  username: string
  full_name: string
}

type AuthContextType = {
  token: string | null
  user: User | null
  setToken: (t: string | null) => void
  setUser: (u: User | null) => void
  login: (u: string, p: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  useEffect(() => {
    // Try to load profile when token present but no user
    const load = async () => {
      if (token && !user) {
        try {
          const me = await api.get('/users/me')
          setUser(me)
        } catch { }
      }
    }
    load()
  }, [])

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await api.post('/users/login', {
      username_or_email: usernameOrEmail,
      password
    })
    if (res?.access_token) {
      // Set token in localStorage immediately so api.get('/users/me') can use it
      localStorage.setItem('token', res.access_token)
      setToken(res.access_token)

      try {
        const me = await api.get('/users/me')
        setUser(me)
        // Update presence
        await api.post('/presence/', { userId: me.id, status: 'online', device: 'web' })
      } catch (e) {
        console.error('Failed to fetch user profile or update presence:', e)
        // If fetching profile fails, we should probably logout or handle it
      }
    } else {
      throw new Error('Login failed')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, setToken, setUser, login, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
