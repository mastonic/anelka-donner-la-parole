import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard' // Admin Dashboard
import ClientDashboard from './components/ClientDashboard'

function App() {
  const [view, setView] = useState('landing')

  return (
    <div className="w-full">
      {view === 'landing' && (
        <LandingPage 
          onStartClient={() => setView('client_dashboard')} 
          onStartAdmin={() => setView('admin_dashboard')} 
        />
      )}
      {view === 'client_dashboard' && (
        <ClientDashboard onBack={() => setView('landing')} />
      )}
      {view === 'admin_dashboard' && (
        <Dashboard onBack={() => setView('landing')} />
      )}
    </div>
  )
}

export default App
