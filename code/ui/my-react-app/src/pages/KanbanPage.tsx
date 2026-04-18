import { type FormEvent, useMemo, useState } from 'react'

type KanbanColumn = 'todo' | 'in-progress' | 'done'

type KanbanCard = {
  id: number
  title: string
  details: string
  column: KanbanColumn
}

const columns: Array<{ key: KanbanColumn; label: string }> = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]

const starterCards: KanbanCard[] = [
  {
    id: 1,
    title: 'Create workflow skeleton',
    details: 'Set up triggers, jobs, and environment variables.',
    column: 'done',
  },
  {
    id: 2,
    title: 'Build app artifact',
    details: 'Run npm build and upload static files.',
    column: 'in-progress',
  },
  {
    id: 3,
    title: 'Deploy to Static Web Apps',
    details: 'Wire deployment token and publish website output.',
    column: 'todo',
  },
]

export default function KanbanPage() {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [cards, setCards] = useState<KanbanCard[]>(starterCards)

  const groupedCards = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        cards: cards.filter((card) => card.column === column.key),
      })),
    [cards],
  )

  const createCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    const nextCard: KanbanCard = {
      id: Date.now(),
      title: title.trim(),
      details: details.trim(),
      column: 'todo',
    }

    setCards((previous) => [nextCard, ...previous])
    setTitle('')
    setDetails('')
  }

  const moveCard = (id: number, direction: 'left' | 'right') => {
    setCards((previous) =>
      previous.map((card) => {
        if (card.id !== id) {
          return card
        }

        if (direction === 'left') {
          if (card.column === 'in-progress') {
            return { ...card, column: 'todo' }
          }
          if (card.column === 'done') {
            return { ...card, column: 'in-progress' }
          }
          return card
        }

        if (card.column === 'todo') {
          return { ...card, column: 'in-progress' }
        }
        if (card.column === 'in-progress') {
          return { ...card, column: 'done' }
        }
        return card
      }),
    )
  }

  return (
    <section className="panel page-enter kanban-panel">
      <p className="kicker">Kanban Board</p>
      <h1>Plan work and move cards forward.</h1>
      <p className="lead">
        Add tasks quickly, then nudge them across columns as work advances.
      </p>

      <form className="kanban-form" onSubmit={createCard}>
        <label>
          Task Title
          <input
            type="text"
            placeholder="Add mobile layout polish"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label>
          Details
          <input
            type="text"
            placeholder="Tune spacing and nav wrapping"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </label>

        <button type="submit" className="save-button">
          Add Card
        </button>
      </form>

      <div className="kanban-grid">
        {groupedCards.map((column) => (
          <section key={column.key} className="kanban-column" aria-label={column.label}>
            <h2>{column.label}</h2>
            {column.cards.length === 0 ? (
              <p className="empty-state">No cards yet.</p>
            ) : (
              <ul>
                {column.cards.map((card) => (
                  <li key={card.id} className="kanban-card">
                    <h3>{card.title}</h3>
                    {card.details ? <p>{card.details}</p> : null}
                    <div className="kanban-controls">
                      <button
                        type="button"
                        onClick={() => moveCard(card.id, 'left')}
                        disabled={card.column === 'todo'}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCard(card.id, 'right')}
                        disabled={card.column === 'done'}
                      >
                        Forward
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}
