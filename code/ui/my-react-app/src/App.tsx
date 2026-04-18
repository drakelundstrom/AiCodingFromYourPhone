import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import BuildFlowPage from './pages/BuildFlowPage'
import HomePage from './pages/HomePage'
import KanbanPage from './pages/KanbanPage'
import ParkingReminderPage from './pages/ParkingReminderPage'
import PhoneTipsPage from './pages/PhoneTipsPage'

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
          <NavLink to="/kanban">Kanban</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<BuildFlowPage />} />
          <Route path="/tips" element={<PhoneTipsPage />} />
          <Route path="/parking" element={<ParkingReminderPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
