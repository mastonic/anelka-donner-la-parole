import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage({ onBack, onSuccess }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ERROR_MESSAGES = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe invalide.',
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères.',
    'auth/popup-closed-by-user': 'Connexion annulée.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
  };

  function handleError(e) {
    setError(ERROR_MESSAGES[e.code] || e.message);
  }

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      onSuccess(result);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'register' ? registerWithEmail : loginWithEmail;
      const result = await fn(email, password);
      onSuccess(result);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-purple-900/40 via-[#0a0a0a] to-pink-900/20 border-r border-white/5 p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <button
          onClick={onBack}
          className="relative flex items-center gap-2 text-white/40 hover:text-white/70 text-xs font-bold uppercase tracking-widest transition w-fit"
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="relative space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-2xl shadow-purple-500/30">
            🎙️
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-3">
              Donner<br />la parole
            </h2>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Crée des vidéos TikTok avec la voix de Dolunaelka en quelques clics.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {['Voix clonée par IA', 'Sous-titres automatiques', 'Vidéo prête à publier'].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-white/40 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/10 text-xs">© 2025 Dolunaelka</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile back */}
        <button
          onClick={onBack}
          className="lg:hidden self-start flex items-center gap-2 text-white/40 hover:text-white/70 text-xs font-bold uppercase tracking-widest mb-8 transition"
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-6 shadow-xl shadow-purple-500/20">
            🎙️
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">
              {mode === 'register' ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="text-white/30 text-sm">
              {mode === 'register'
                ? 'Rejoins la communauté Dolunaelka.'
                : 'Accède à ton espace personnel.'}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold text-sm py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mb-5 disabled:opacity-50 shadow-lg"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs font-bold uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/7 transition"
              />
            </div>

            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-white/7 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs font-medium bg-red-400/8 border border-red-400/15 rounded-xl px-3.5 py-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold text-sm py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-1"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-white/25 text-xs mt-6">
            {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            {' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-purple-400 font-bold hover:text-purple-300 transition"
            >
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
