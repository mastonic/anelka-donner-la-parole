import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard' // Admin Dashboard
import ClientDashboard from './components/ClientDashboard'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('💥 Crash capturé:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/30 rounded-3xl p-10 space-y-6">
            <h1 className="text-2xl font-black text-red-400 uppercase tracking-tighter">Erreur de rendu</h1>
            <pre className="text-xs text-red-300/70 bg-black/40 p-6 rounded-2xl overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack?.split('\n').slice(0, 8).join('\n')}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        <ErrorBoundary key="client">
          <ClientDashboard onBack={() => setView('landing')} />
        </ErrorBoundary>
      )}
      {view === 'admin_dashboard' && (
        <ErrorBoundary key="admin">
          <Dashboard onBack={() => setView('landing')} />
        </ErrorBoundary>
      )}
    </div>
  )
}

export default App
