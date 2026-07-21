import { useState } from 'react'

// ---- Date helpers -------------------------------------------------
// Return the number of days in a given month (month is 0-indexed: 0 = Jan)
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Which weekday (0 = Sun ... 6 = Sat) does the 1st of the month fall on?
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay()
}

// Turn a year/month/day into a stable string key like "2026-7-21"
function dateKey(year, month, day) {
  return `${year}-${month}-${day}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// A few starter subjects. You can add more from the UI.
const DEFAULT_SUBJECTS = [
  { name: 'Library Work', color: '#2563eb' },
  { name: 'Greater Angels', color: '#16a34a' },
  { name: 'Portfolio', color: '#9333ea' },
  { name: 'Python / LeetCode', color: '#ea580c' },
  { name: 'Applications', color: '#db2777' },
  { name: 'Personal', color: '#0d9488' },
]

export default function App() {
  const today = new Date()

  // Which month we're currently viewing
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // All subjects (label + color). Stored in React state only.
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS)

  // Events keyed by date string -> array of { id, subject, title, description }
  const [events, setEvents] = useState({})

  // The day the user clicked, so we can show its detail panel. null = none open.
  const [selectedKey, setSelectedKey] = useState(null)

  // Form state for adding a new event
  const [form, setForm] = useState({ subject: DEFAULT_SUBJECTS[0].name, title: '', description: '' })

  // Form state for adding a new subject
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6' })

  // Look up a subject's color by its name (falls back to grey)
  function colorFor(subjectName) {
    const s = subjects.find((x) => x.name === subjectName)
    return s ? s.color : '#94a3b8'
  }

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
    setSelectedKey(null)
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
    setSelectedKey(null)
  }

  function goToToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedKey(null)
  }

  // Add the current form as an event on the selected day
  function addEvent() {
    if (!selectedKey || !form.title.trim()) return
    const newEvent = {
      id: Date.now(),               // simple unique id
      subject: form.subject,
      title: form.title.trim(),
      description: form.description.trim(),
    }
    setEvents((prev) => {
      const dayEvents = prev[selectedKey] ? [...prev[selectedKey]] : []
      dayEvents.push(newEvent)
      return { ...prev, [selectedKey]: dayEvents }
    })
    // Reset the title/description but keep the chosen subject for convenience
    setForm((f) => ({ ...f, title: '', description: '' }))
  }

  // Remove one event from a given day
  function deleteEvent(key, id) {
    setEvents((prev) => {
      const dayEvents = (prev[key] || []).filter((e) => e.id !== id)
      const next = { ...prev, [key]: dayEvents }
      if (dayEvents.length === 0) delete next[key]
      return next
    })
  }

  // Add a brand new subject with its own color
  function addSubject() {
    const name = newSubject.name.trim()
    if (!name) return
    if (subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) return
    setSubjects((prev) => [...prev, { name, color: newSubject.color }])
    setNewSubject({ name: '', color: '#3b82f6' })
  }

  // ---- Build the grid of day cells --------------------------------
  const totalDays = daysInMonth(viewYear, viewMonth)
  const leadingBlanks = firstWeekday(viewYear, viewMonth)
  const cells = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null) // empty pad cells
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  const selectedEvents = selectedKey ? events[selectedKey] || [] : []

  return (
    <div className="app">
      <header className="app-header">
        <h1>Study Calendar</h1>
        <p className="subtitle">Plan your weeks. Click a day to add something.</p>
      </header>

      <div className="toolbar">
        <div className="month-nav">
          <button onClick={goToPrevMonth} aria-label="Previous month">‹</button>
          <h2>{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <button onClick={goToNextMonth} aria-label="Next month">›</button>
        </div>
        <button className="today-btn" onClick={goToToday}>Today</button>
      </div>

      <div className="legend">
        {subjects.map((s) => (
          <span className="legend-item" key={s.name}>
            <span className="dot" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="weekday-row">
        {WEEKDAYS.map((w) => (
          <div className="weekday" key={w}>{w}</div>
        ))}
      </div>

      <div className="grid">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div className="cell empty" key={`blank-${idx}`} />
          }
          const key = dateKey(viewYear, viewMonth, day)
          const dayEvents = events[key] || []
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear()
          const isSelected = key === selectedKey

          return (
            <div
              className={`cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              key={key}
              onClick={() => setSelectedKey(key)}
            >
              <div className="cell-day">{day}</div>
              <div className="cell-events">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    className="event-chip"
                    key={e.id}
                    style={{ background: colorFor(e.subject) }}
                    title={`${e.subject}: ${e.title}`}
                  >
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="more">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel: only shows when a day is selected */}
      {selectedKey && (
        <div className="panel">
          <div className="panel-header">
            <h3>
              {(() => {
                const [y, m, d] = selectedKey.split('-').map(Number)
                return `${MONTH_NAMES[m]} ${d}, ${y}`
              })()}
            </h3>
            <button className="close" onClick={() => setSelectedKey(null)}>Close</button>
          </div>

          {/* Existing events for this day */}
          <div className="event-list">
            {selectedEvents.length === 0 && (
              <p className="empty-note">Nothing planned yet. Add something below.</p>
            )}
            {selectedEvents.map((e) => (
              <div className="event-row" key={e.id}>
                <span className="event-color" style={{ background: colorFor(e.subject) }} />
                <div className="event-text">
                  <strong>{e.title}</strong>
                  <span className="event-subject">{e.subject}</span>
                  {e.description && <p className="event-desc">{e.description}</p>}
                </div>
                <button className="delete" onClick={() => deleteEvent(selectedKey, e.id)}>×</button>
              </div>
            ))}
          </div>

          {/* Add-event form */}
          <div className="add-form">
            <select
              value={form.subject}
              onChange={(ev) => setForm({ ...form, subject: ev.target.value })}
            >
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Title (e.g. LeetCode: two-sum)"
              value={form.title}
              onChange={(ev) => setForm({ ...form, title: ev.target.value })}
              onKeyDown={(ev) => ev.key === 'Enter' && addEvent()}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(ev) => setForm({ ...form, description: ev.target.value })}
            />
            <button className="add-btn" onClick={addEvent}>Add to day</button>
          </div>
        </div>
      )}

      {/* Subject manager */}
      <div className="subject-manager">
        <h3>Add a subject</h3>
        <div className="subject-form">
          <input
            type="text"
            placeholder="Subject name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
          />
          <input
            type="color"
            value={newSubject.color}
            onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
            aria-label="Subject color"
          />
          <input
            type="text"
            className="hex-input"
            placeholder="#3b82f6"
            value={newSubject.color}
            onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
          />
          <button onClick={addSubject}>Add subject</button>
        </div>
      </div>

      <footer className="app-footer">
        Note: this calendar keeps data in memory only, so a refresh clears it.
        Persisting data is your next feature to build.
      </footer>
    </div>
  )
}
