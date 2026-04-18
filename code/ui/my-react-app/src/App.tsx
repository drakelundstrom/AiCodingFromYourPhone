import { type FormEvent, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

const prompts = [
  'Generate a login screen with playful motion and spring transitions.',
  'Refactor this form into reusable components with TypeScript types.',
  'Build a camera-first onboarding flow for mobile users.',
]

type ParkingReminder = {
  id: number
  location: string
  spot: string
  remindAt: string
  notes: string
}

function HomePage() {
  return (
    <section className="panel page-enter">
      <p className="kicker">Hi there</p>
      <h1>AI vibecoding from your phone is real.</h1>
      <p className="lead">
        Open your editor, talk to your coding assistant, and shape features
        while you are in a cafe line, on a train, or waiting for your coffee.
      </p>

      <div className="card-grid">
        <article className="card burst">
          <h2>Build fast</h2>
          <p>
            Sketch the idea in plain language, then iterate route by route until
            it feels right.
          </p>
        </article>
        <article className="card float">
          <h2>Ship confidently</h2>
          <p>
            Keep your flow with tiny feedback loops: prompt, preview, tweak,
            and merge.
          </p>
        </article>
        <article className="card sway">
          <h2>Stay playful</h2>
          <p>
            Great demos feel alive. Add color, personality, and motion that
            makes people smile.
          </p>
        </article>
      </div>
    </section>
  )
}

function BuildFlowPage() {
  return (
    <section className="panel page-enter">
      <p className="kicker">Live Demo Flow</p>
      <h1>From prompt to production on a pocket device.</h1>
      <ol className="flow-list">
        <li>Describe the feature in one crisp sentence.</li>
        <li>Ask for the smallest working route and component first.</li>
        <li>Style it boldly so your audience sees momentum immediately.</li>
        <li>Add edge cases and fallback routes before you finish.</li>
      </ol>
    </section>
  )
}

function PhoneTipsPage() {
  return (
    <section className="panel page-enter">
      <p className="kicker">Prompt Ideas</p>
      <h1>Use these while vibecoding from your phone.</h1>
      <ul className="prompt-list">
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
    </section>
  )
}

function ParkingReminderPage() {
  const [location, setLocation] = useState('')
  const [spot, setSpot] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [notes, setNotes] = useState('')
  const [reminders, setReminders] = useState<ParkingReminder[]>([])

  const handleSaveReminder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!location.trim() || !remindAt) {
      return
    }

    const reminder: ParkingReminder = {
      id: Date.now(),
      location: location.trim(),
      spot: spot.trim(),
      remindAt,
      notes: notes.trim(),
    }

    setReminders((previous) => [reminder, ...previous])
    setLocation('')
    setSpot('')
    setRemindAt('')
    setNotes('')
  }

  return (
    <section className="panel page-enter parking-panel">
      <p className="kicker">Parking Reminder</p>
      <h1>Never forget where you parked.</h1>
      <p className="lead">
        Save the location, spot details, and a reminder time before you walk
        away.
      </p>

      <form className="parking-form" onSubmit={handleSaveReminder}>
        <label>
          Location
          <input
            type="text"
            placeholder="Mall West Garage"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />
        </label>

        <label>
          Spot
          <input
            type="text"
            placeholder="Level 3 - B12"
            value={spot}
            onChange={(event) => setSpot(event.target.value)}
          />
        </label>

        <label>
          Remind Me At
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(event) => setRemindAt(event.target.value)}
            required
          />
        </label>

        <label className="full-width">
          Notes
          <textarea
            rows={3}
            placeholder="Blue pillar near elevator, ticket in glove box"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <button type="submit" className="save-button">
          Save Reminder
        </button>
      </form>

      <section className="reminder-list" aria-live="polite">
        <h2>Saved Reminders</h2>
        {reminders.length === 0 ? (
          <p className="empty-state">No reminders yet. Add your first one above.</p>
        ) : (
          <ul>
            {reminders.map((reminder) => (
              <li key={reminder.id}>
                <p>
                  <strong>{reminder.location}</strong>
                  {reminder.spot ? ` - ${reminder.spot}` : ''}
                </p>
                <p>{new Date(reminder.remindAt).toLocaleString()}</p>
                {reminder.notes ? <p>{reminder.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <p className="brand">Phone to Prod</p>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/build">Build Flow</NavLink>
          <NavLink to="/tips">Prompt Tips</NavLink>
          <NavLink to="/parking">Parking Reminder</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<BuildFlowPage />} />
          <Route path="/tips" element={<PhoneTipsPage />} />
          <Route path="/parking" element={<ParkingReminderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
