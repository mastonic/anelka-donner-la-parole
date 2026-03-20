import React, { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import ClientDashboard from './components/ClientDashboard'
import LoginPage from './components/LoginPage'
import { Loader2 } from 'lucide-react'

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

function AppContent() {
  const { user, isAdmin, loading, logout } = useAuth()
  const [view, setView] = useState('landing') // 'landing' | 'login' | 'client_dashboard' | 'admin_dashboard'
  const [loginTarget, setLoginTarget] = useState(null) // 'client' | 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/30" size={40} />
      </div>
    )
  }

  // After login success, redirect to the intended destination
  function handleLoginSuccess({ isAdmin: userIsAdmin }) {
    if (loginTarget === 'admin' && userIsAdmin) {
      setView('admin_dashboard')
    } else {
      setView('client_dashboard')
    }
    setLoginTarget(null)
  }

  function handleStartClient() {
    if (user) {
      setView('client_dashboard')
    } else {
      setLoginTarget('client')
      setView('login')
    }
  }

  function handleStartAdmin() {
    if (user && isAdmin) {
      setView('admin_dashboard')
    } else {
      setLoginTarget('admin')
      setView('login')
    }
  }

  function handleBack() {
    setView('landing')
  }

  return (
    <div className="w-full">
      {view === 'landing' && (
        <LandingPage
          onStartClient={handleStartClient}
          onStartAdmin={handleStartAdmin}
          user={user}
          isAdmin={isAdmin}
          onLogout={logout}
        />
      )}

      {view === 'login' && (
        <LoginPage
          onBack={() => setView('landing')}
          onSuccess={handleLoginSuccess}
        />
      )}

      {view === 'client_dashboard' && user && (
        <ErrorBoundary key="client">
          <ClientDashboard onBack={handleBack} />
        </ErrorBoundary>
      )}

      {view === 'admin_dashboard' && user && isAdmin && (
        <ErrorBoundary key="admin">
          <Dashboard onBack={handleBack} />
        </ErrorBoundary>
      )}

      {/* Fallback: user tries to access protected view without auth */}
      {(view === 'client_dashboard' && !user) && (
        <LoginPage onBack={handleBack} onSuccess={handleLoginSuccess} />
      )}
      {(view === 'admin_dashboard' && (!user || !isAdmin)) && (
        <LoginPage onBack={handleBack} onSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
