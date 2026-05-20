import { useState } from 'react'
import './App.css'
// prototype – no backend calls, static mock data only

const mockWorkouts = [
  { id: 1, date: '2026-05-19', type: 'run', title: 'Easy Run', duration: 45, distance: '8.2 km', load: 62, rpe: 5 },
  { id: 2, date: '2026-05-18', type: 'strength', title: 'Upper Body', duration: 60, sets: '4x8', load: 78, rpe: 7 },
  { id: 3, date: '2026-05-17', type: 'run', title: 'Tempo Run', duration: 50, distance: '10.1 km', load: 95, rpe: 8 },
  { id: 4, date: '2026-05-15', type: 'strength', title: 'Legs & Core', duration: 70, sets: '5x5', load: 112, rpe: 9 },
  { id: 5, date: '2026-05-14', type: 'run', title: 'Long Run', duration: 90, distance: '18 km', load: 130, rpe: 6 },
]

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

function Nav({ active, setActive }) {
  return (
    <nav className="sidebar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">MultiLoad</span>
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
        <div className="user-avatar">KJ</div>
        <div className="user-info">
          <div className="user-name">Kacper J.</div>
          <div className="user-plan">Pro Plan</div>
        </div>
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

function Dashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">Tuesday, May 20 — Week 21</p>
        </div>
        <button className="btn-primary">+ Log Workout</button>
      </div>

      <div className="stats-grid">
        <StatCard label="Weekly Load" value="477" unit="AU" sub="TRIMP + S-RPE" color="blue" trend={12} />
        <StatCard label="Recovery Score" value="68" unit="%" sub="Above baseline" color="green" trend={5} />
        <StatCard label="Workouts This Week" value="3" unit="" sub="Goal: 5" color="purple" />
        <StatCard label="Injury Risk" value="Low" unit="" sub="All metrics nominal" color="teal" />
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
        <div className="workout-list">
          {mockWorkouts.map(w => (
            <div key={w.id} className="workout-row">
              <div className={`workout-type-badge type-${w.type}`}>
                {w.type === 'run' ? '🏃' : '🏋️'}
              </div>
              <div className="workout-info">
                <div className="workout-title">{w.title}</div>
                <div className="workout-meta">{w.date} · {w.duration} min {w.distance || w.sets || ''}</div>
              </div>
              <div className="workout-load">
                <div className="load-badge">{w.load} AU</div>
                <div className="rpe-badge">RPE {w.rpe}</div>
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

function LogWorkout() {
  const [type, setType] = useState('run')
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Log Workout</h1>
          <p className="page-sub">Record your training session</p>
        </div>
      </div>

      <div className="card form-card">
        <div className="type-selector">
          <button className={`type-btn ${type === 'run' ? 'selected' : ''}`} onClick={() => setType('run')}>
            🏃 Running
          </button>
          <button className={`type-btn ${type === 'strength' ? 'selected' : ''}`} onClick={() => setType('strength')}>
            🏋️ Strength
          </button>
          <button className={`type-btn ${type === 'cycle' ? 'selected' : ''}`} onClick={() => setType('cycle')}>
            🚴 Cycling
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" defaultValue="2026-05-20" />
          </div>
          <div className="form-group">
            <label>Duration (min)</label>
            <input type="number" className="form-input" placeholder="45" />
          </div>

          {type === 'run' && <>
            <div className="form-group">
              <label>Distance (km)</label>
              <input type="number" className="form-input" placeholder="10.0" step="0.1" />
            </div>
            <div className="form-group">
              <label>Avg HR (bpm)</label>
              <input type="number" className="form-input" placeholder="152" />
            </div>
          </>}

          {type === 'strength' && <>
            <div className="form-group">
              <label>Number of Sets</label>
              <input type="number" className="form-input" placeholder="16" />
            </div>
            <div className="form-group">
              <label>Session Type</label>
              <select className="form-input">
                <option>Upper Body</option>
                <option>Lower Body</option>
                <option>Full Body</option>
                <option>Core</option>
              </select>
            </div>
          </>}

          <div className="form-group full-width">
            <label>Perceived Exertion (RPE 1–10)</label>
            <div className="rpe-slider-wrap">
              <input type="range" min="1" max="10" defaultValue="6" className="rpe-slider" />
              <div className="rpe-labels">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea className="form-input form-textarea" placeholder="How did you feel? Any discomfort?" />
          </div>
        </div>

        <div className="form-footer">
          <div className="estimated-load">
            <span>Estimated Load:</span>
            <strong>~74 AU</strong>
            <span className="load-method">(S-RPE method)</span>
          </div>
          <button className="btn-primary">Save Workout</button>
        </div>
      </div>
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

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = { dashboard: <Dashboard />, calendar: <Calendar />, log: <LogWorkout />, analytics: <Analytics /> }

  return (
    <div className="app-layout">
      <Nav active={page} setActive={setPage} />
      <main className="main-content">
        {pages[page] || <Dashboard />}
      </main>
    </div>
  )
}
