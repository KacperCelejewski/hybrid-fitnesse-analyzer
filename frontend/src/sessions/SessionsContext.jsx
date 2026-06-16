import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createSession as apiCreate, listSessions } from '../api/sessions'
import { useAuth } from '../auth/AuthContext'

const SessionsContext = createContext(null)

export function SessionsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSessions(await listSessions())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function sync() {
      if (!isAuthenticated) {
        if (active) setSessions([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await listSessions()
        if (active) setSessions(data)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    sync()
    return () => {
      active = false
    }
  }, [isAuthenticated])

  // Create a session and prepend it to the local list so the UI updates at once.
  const addSession = useCallback(async (payload) => {
    const created = await apiCreate(payload)
    setSessions((prev) => [created, ...prev])
    return created
  }, [])

  const value = { sessions, loading, error, refresh, addSession }
  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSessions() {
  const ctx = useContext(SessionsContext)
  if (!ctx) {
    throw new Error('useSessions must be used within a SessionsProvider')
  }
  return ctx
}
