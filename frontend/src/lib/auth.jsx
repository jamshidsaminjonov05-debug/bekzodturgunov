import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken())
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (name, phone) => {
    const r = await api('/auth/login', { method: 'POST', body: { name, phone } })
    setToken(r.token)
    setUser(r.user)
    setLoginOpen(false)
    return r.user
  }, [])

  const adminLogin = useCallback(async (password) => {
    const r = await api('/auth/admin', { method: 'POST', body: { password } })
    setToken(r.token)
    setUser(r.user)
    return r.user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) return
    try { setUser(await api('/auth/me')) } catch { /* ignore */ }
  }, [])

  return (
    <AuthCtx.Provider value={{ user, ready, login, adminLogin, logout, refresh, loginOpen, openLogin: () => setLoginOpen(true), closeLogin: () => setLoginOpen(false) }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
