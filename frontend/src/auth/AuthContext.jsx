import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, getStoredToken, storeToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getStoredToken()))

  // On first load with a stored token, resolve the current user. If the token
  // is invalid or expired, drop it so the UI falls back to the login screen.
  // When there is no token, loading already starts as false (see useState above).
  useEffect(() => {
    if (!token) {
      return
    }
    let active = true
    apiRequest('/api/auth/me', { token })
      .then((me) => {
        if (active) setUser(me)
      })
      .catch(() => {
        if (active) {
          storeToken(null)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  async function login(email, password) {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    storeToken(res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  async function register(email, password, displayName) {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
    })
    storeToken(res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  function logout() {
    storeToken(null)
    setToken(null)
    setUser(null)
  }

  const value = { token, user, loading, isAuthenticated: Boolean(token), login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Co-located with the provider by design; Fast Refresh granularity is not a concern here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
