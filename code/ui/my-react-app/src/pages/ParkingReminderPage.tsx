import { type FormEvent, useState } from 'react'

type ParkingReminder = {
  id: number
  location: string
  spot: string
  remindAt: string
  notes: string
}

export default function ParkingReminderPage() {
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
