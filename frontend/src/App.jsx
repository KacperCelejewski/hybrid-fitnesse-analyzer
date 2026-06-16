import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { SessionsProvider, useSessions } from './sessions/SessionsContext'
import AuthPage from './pages/AuthPage'
// Dashboard widgets below use static mock data; authentication is wired to the backend.

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const calendarData = {
  '13': null,
  '14': { type: 'run', label: 'Long Run' },
  '15': { type: 'strength', label: 'Legs' },
  '16': null,
  '17': { type: 'run', label: 'Tempo' },
  '18': { type: 'strength', label: 'Upper' },
  '19': { type: 'run', label: 'Easy' },
  '20': { type: 'rest', label: 'Rest' },
  '21': null,
  '22': { type: 'run', label: 'Intervals' },
  '23': { type: 'strength', label: 'Full Body' },
  '24': null,
  '25': { type: 'run', label: 'Tempo' },
  '26': { type: 'strength', label: 'Upper' },
  '27': { type: 'run', label: 'Long Run' },
}

function initials(user) {
  const source = user?.displayName || user?.email || '?'
  return source.trim().slice(0, 2).toUpperCase()
}

function Nav({ active, setActive, user, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">LoadPace</span>
      </div>
      <ul className="nav-links">
        {[
          { id: 'dashboard', icon: '◉', label: 'Dashboard' },
          { id: 'calendar', icon: '▦', label: 'Calendar' },
          { id: 'log', icon: '＋', label: 'Log Workout' },
          { id: 'analytics', icon: '▲', label: 'Analytics' },
          { id: 'profile', icon: '◎', label: 'Profile' },
        ].map(item => (
          <li key={item.id}>
            <button
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div className="user-avatar">{initials(user)}</div>
        <div className="user-info">
          <div className="user-name">{user?.displayName || user?.email || 'Athlete'}</div>
          <div className="user-plan">{user?.email}</div>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} title="Sign out">
          ⎋
        </button>
      </div>
    </nav>
  )
}

function StatCard({ label, value, unit, sub, color, trend }) {
  return (
    <div className={`stat-card card-${color}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {trend && <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <div className="stat-value">{value}<span className="stat-unit"> {unit}</span></div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

function LoadBar({ label, value, max, color }) {
  return (
    <div className="load-bar-row">
      <span className="load-bar-label">{label}</span>
      <div className="load-bar-track">
        <div className="load-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="load-bar-value">{value}</span>
    </div>
  )
}

function FatigueGauge({ value }) {
  const angle = (value / 100) * 180 - 90
  const color = value < 40 ? '#22c55e' : value < 70 ? '#f59e0b' : '#ef4444'
  const label = value < 40 ? 'Fresh' : value < 70 ? 'Moderate' : 'High Fatigue'
  return (
    <div className="gauge-wrap">
      <div className="gauge">
        <div className="gauge-arc" />
        <div className="gauge-needle" style={{ transform: `rotate(${angle}deg)` }} />
        <div className="gauge-center" />
      </div>
      <div className="gauge-value" style={{ color }}>{value}<span>%</span></div>
      <div className="gauge-label" style={{ color }}>{label}</div>
    </div>
  )
}

const SPORT_ICON = { RUN: '🏃', CYCLE: '🚴', STRENGTH: '🏋️' }
const SPORT_LABEL = { RUN: 'Run', CYCLE: 'Cycle', STRENGTH: 'Strength' }

function sportClass(type) {
  return type === 'STRENGTH' ? 'strength' : 'run'
}

function withinLastDays(dateStr, days) {
  const d = new Date(dateStr)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return d >= cutoff
}

function Dashboard() {
  const { sessions, loading, error } = useSessions()

  const weekly = sessions.filter((s) => withinLastDays(s.date, 7))
  const weeklyLoad = Math.round(weekly.reduce((sum, s) => sum + (s.loadAu || 0), 0))
  const recent = sessions.slice(0, 6)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">Your training load at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Weekly Load" value={weeklyLoad} unit="AU" sub="TRIMP + S-RPE" color="blue" />
        <StatCard label="Workouts This Week" value={weekly.length} unit="" sub="Last 7 days" color="purple" />
        <StatCard label="Sessions Logged" value={sessions.length} unit="" sub="All time" color="teal" />
        <StatCard label="Recovery Score" value="68" unit="%" sub="Above baseline" color="green" trend={5} />
      </div>

      <div className="content-row">
        <div className="card fatigue-card">
          <h2 className="card-title">Current Fatigue</h2>
          <FatigueGauge value={54} />
          <div className="fatigue-note">Next recommended rest day: <strong>Friday</strong></div>
        </div>

        <div className="card load-card">
          <h2 className="card-title">7-Day Load Breakdown</h2>
          <LoadBar label="Monday" value={0} max={150} color="#6366f1" />
          <LoadBar label="Tuesday" value={0} max={150} color="#6366f1" />
          <LoadBar label="Wednesday" value={95} max={150} color="#6366f1" />
          <LoadBar label="Thursday" value={0} max={150} color="#6366f1" />
          <LoadBar label="Friday" value={112} max={150} color="#8b5cf6" />
          <LoadBar label="Saturday" value={130} max={150} color="#6366f1" />
          <LoadBar label="Sunday" value={62} max={150} color="#6366f1" />
          <div className="load-legend">
            <span className="legend-dot" style={{ background: '#6366f1' }} /> Run
            <span className="legend-dot" style={{ background: '#8b5cf6', marginLeft: 12 }} /> Strength
          </div>
        </div>
      </div>

      <div className="card recent-card">
        <h2 className="card-title">Recent Workouts</h2>
        {loading && <div className="empty-note">Loading…</div>}
        {error && <div className="empty-note error-note">{error}</div>}
        {!loading && !error && recent.length === 0 && (
          <div className="empty-note">No workouts logged yet. Use “Log Workout” to add your first session.</div>
        )}
        <div className="workout-list">
          {recent.map((s) => (
            <div key={s.id} className="workout-row">
              <div className={`workout-type-badge type-${sportClass(s.type)}`}>
                {SPORT_ICON[s.type] || '🏃'}
              </div>
              <div className="workout-info">
                <div className="workout-title">{SPORT_LABEL[s.type] || s.type}</div>
                <div className="workout-meta">
                  {s.date} · {s.durationMin} min
                  {s.distanceKm ? ` · ${s.distanceKm} km` : ''}
                  {s.sets ? ` · ${s.sets} sets` : ''}
                </div>
              </div>
              <div className="workout-load">
                <div className="load-badge">{s.loadAu} AU</div>
                <div className="rpe-badge">{s.loadMethod}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Calendar() {
  const days = Array.from({ length: 19 }, (_, i) => i + 13)
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Training Calendar</h1>
          <p className="page-sub">May 2026</p>
        </div>
        <div className="btn-group">
          <button className="btn-outline">◀ Apr</button>
          <button className="btn-outline">Jun ▶</button>
        </div>
      </div>

      <div className="card">
        <div className="cal-weekdays">
          {weekDays.map(d => <div key={d} className="cal-weekday">{d}</div>)}
        </div>
        <div className="cal-grid">
          {days.map(day => {
            const entry = calendarData[String(day)]
            const isToday = day === 20
            return (
              <div key={day} className={`cal-cell ${isToday ? 'today' : ''} ${entry ? 'has-entry' : ''}`}>
                <span className="cal-day-num">{day}</span>
                {entry && (
                  <div className={`cal-entry type-${entry.type}`}>{entry.label}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="cal-legend">
        <span className="type-run cal-badge">Run</span>
        <span className="type-strength cal-badge">Strength</span>
        <span className="type-rest cal-badge">Rest</span>
      </div>
    </div>
  )
}

const TYPE_OPTIONS = [
  { ui: 'run', api: 'RUN', icon: '🏃', label: 'Running' },
  { ui: 'strength', api: 'STRENGTH', icon: '🏋️', label: 'Strength' },
  { ui: 'cycle', api: 'CYCLE', icon: '🚴', label: 'Cycling' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function LogWorkout() {
  const { addSession } = useSessions()
  const [type, setType] = useState('run')
  const [date, setDate] = useState(todayIso())
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [avgHr, setAvgHr] = useState('')
  const [sets, setSets] = useState('')
  const [rpe, setRpe] = useState(6)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const isEndurance = type === 'run' || type === 'cycle'

  function resetFields() {
    setDuration('')
    setDistance('')
    setAvgHr('')
    setSets('')
    setNotes('')
    setRpe(6)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setResult(null)
    setSaving(true)
    try {
      const apiType = TYPE_OPTIONS.find((o) => o.ui === type)?.api
      const payload = {
        date,
        type: apiType,
        durationMin: Number(duration),
        rpe: Number(rpe),
        avgHr: isEndurance && avgHr ? Number(avgHr) : undefined,
        distanceKm: isEndurance && distance ? Number(distance) : undefined,
        sets: type === 'strength' && sets ? Number(sets) : undefined,
        notes: notes.trim() || undefined,
      }
      const saved = await addSession(payload)
      setResult(saved)
      resetFields()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Log Workout</h1>
          <p className="page-sub">Record your training session</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="type-selector">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.ui}
              type="button"
              className={`type-btn ${type === o.ui ? 'selected' : ''}`}
              onClick={() => setType(o.ui)}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" min="1" className="form-input" placeholder="45" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>

          {isEndurance && <>
            <div className="form-group">
              <label>Distance (km)</label>
              <input type="number" className="form-input" placeholder="10.0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Avg HR (bpm)</label>
              <input type="number" className="form-input" placeholder="152" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
            </div>
          </>}

          {type === 'strength' && (
            <div className="form-group">
              <label>Number of Sets</label>
              <input type="number" className="form-input" placeholder="16" value={sets} onChange={(e) => setSets(e.target.value)} />
            </div>
          )}

          <div className="form-group full-width">
            <label>Perceived Exertion (RPE {rpe}/10)</label>
            <div className="rpe-slider-wrap">
              <input type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="rpe-slider" />
              <div className="rpe-labels">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea className="form-input form-textarea" placeholder="How did you feel? Any discomfort?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}
        {result && (
          <div className="form-success" role="status">
            Saved — estimated load <strong>{result.loadAu} AU</strong> ({result.loadMethod} method).
          </div>
        )}

        <div className="form-footer">
          <div className="estimated-load">
            <span>Load is estimated on save using</span>
            <strong>{isEndurance ? 'TRIMP / S-RPE' : 'S-RPE'}</strong>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Workout'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Analytics() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="page-sub">Training load trends & recovery insights</p>
        </div>
        <div className="btn-group">
          <button className="btn-outline active-btn">4W</button>
          <button className="btn-outline">8W</button>
          <button className="btn-outline">3M</button>
        </div>
      </div>

      <div className="analytics-top">
        <div className="card chart-card">
          <h2 className="card-title">Weekly Load (AU)</h2>
          <div className="bar-chart">
            {[320, 410, 280, 477].map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar-fill" style={{ height: `${(v / 550) * 160}px` }}>
                  <span className="bar-val">{v}</span>
                </div>
                <span className="bar-label">W{i + 18}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <h2 className="card-title">Acute : Chronic Load Ratio</h2>
          <div className="acwr-display">
            <div className="acwr-value">1.18</div>
            <div className="acwr-zone safe">Safe Zone</div>
            <div className="acwr-scale">
              <div className="acwr-track">
                <div className="acwr-zones">
                  <span className="zone-under">Under</span>
                  <span className="zone-safe">0.8 – 1.3</span>
                  <span className="zone-danger">Risk</span>
                </div>
                <div className="acwr-marker" style={{ left: '55%' }} />
              </div>
            </div>
            <p className="acwr-note">Load progression is within optimal range. Continue current plan.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Load by Sport</h2>
        <div className="sport-split">
          <div className="sport-item">
            <div className="sport-header">
              <span>🏃 Running</span>
              <span>62%</span>
            </div>
            <div className="sport-bar-track">
              <div className="sport-bar-fill run-fill" style={{ width: '62%' }} />
            </div>
            <div className="sport-meta">TRIMP model · Avg HR 154 bpm</div>
          </div>
          <div className="sport-item">
            <div className="sport-header">
              <span>🏋️ Strength</span>
              <span>38%</span>
            </div>
            <div className="sport-bar-track">
              <div className="sport-bar-fill strength-fill" style={{ width: '38%' }} />
            </div>
            <div className="sport-meta">S-RPE model · Avg sets: 18</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState('dashboard')

  const pages = { dashboard: <Dashboard />, calendar: <Calendar />, log: <LogWorkout />, analytics: <Analytics /> }

  return (
    <SessionsProvider>
      <div className="app-layout">
        <Nav active={page} setActive={setPage} user={user} onLogout={logout} />
        <main className="main-content">
          {pages[page] || <Dashboard />}
        </main>
      </div>
    </SessionsProvider>
  )
}

function AuthGate() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return <div className="auth-loading">Loading…</div>
  }
  return isAuthenticated ? <AppShell /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
