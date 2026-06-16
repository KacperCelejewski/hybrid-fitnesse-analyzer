import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await register(email, password, displayName.trim() || null)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">⚡</span>
          <span className="auth-brand-name">LoadPace</span>
        </div>
        <h1 className="auth-title">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'Start tracking your multisport training load.'
            : 'Sign in to continue to your training dashboard.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor="displayName">Display name</label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Kacper"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 8 : undefined}
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="auth-switch-btn" onClick={switchMode}>
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
