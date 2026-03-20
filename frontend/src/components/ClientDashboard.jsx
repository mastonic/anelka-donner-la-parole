import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Settings, LogOut, ChevronLeft, PlusCircle, Wallet, Award, Clock, CheckCircle2, AlertCircle, TrendingUp, Loader2, BarChart3, Video, Shield } from 'lucide-react';
import { useAuth } from '../AuthContext';
import SubmissionForm from './SubmissionForm';
import TiktokSheet from './TiktokSheet';
import VideoAnalytics from './VideoAnalytics';

const ClientDashboard = ({ onBack }) => {
  const { user, logout } = useAuth();

  // Pseudo: stored per user UID in localStorage, defaults to Google displayName
  const pseudoKey = user ? `userPseudo_${user.uid}` : 'userPseudo_guest';
  const defaultPseudo = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Créateur';

  const [userPseudo, setUserPseudo] = useState(
    () => localStorage.getItem(pseudoKey) || defaultPseudo
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmission, setShowSubmission] = useState(false);
  const [selectedStoryForSheet, setSelectedStoryForSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({ pseudo: userPseudo, storiesCount: 0, balance: '0.00', stories: [] });

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch by UID first (accurate), fallback to pseudo
      const res = await fetch(`/api/user/profile-by-uid/${user.uid}`);
      const data = await res.json();
      // If UID returns stories, use them; otherwise try pseudo
      if (data.storiesCount > 0) {
        setProfile(data);
        if (data.pseudo) {
          setUserPseudo(data.pseudo);
          localStorage.setItem(pseudoKey, data.pseudo);
        }
      } else {
        const res2 = await fetch(`/api/user/profile/${userPseudo}`);
        const data2 = await res2.json();
        setProfile(data2);
      }
    } catch (err) {
      console.error('Fetch profile failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [showSubmission, user]);

  const handleLogout = async () => { await logout(); onBack(); };

  const stories = profile.stories || [];
  const latestStory = stories.length > 0 ? stories[0] : null;

  const statusProgress = {
    'wait':                { label: 'En attente',            color: 'bg-white/20',    percent: 20  },
    'analysis':            { label: "En cours d'analyse",   color: 'bg-blue-400',    percent: 40  },
    'selected':            { label: 'Sélectionnée',         color: 'bg-purple-400',  percent: 60  },
    'generating_script':   { label: 'Script en cours',      color: 'bg-yellow-400',  percent: 65  },
    'generating_images':   { label: 'Images en cours',      color: 'bg-yellow-400',  percent: 70  },
    'validée':             { label: 'En production',        color: 'bg-yellow-400',  percent: 80  },
    'production':          { label: 'En production',        color: 'bg-yellow-400',  percent: 80  },
    'published':           { label: 'Publiée',              color: 'bg-emerald-400', percent: 100 },
    'rejected':            { label: 'Non retenue',          color: 'bg-red-400',     percent: 0   },
    'error_production':    { label: 'En traitement',        color: 'bg-white/20',    percent: 20  },
    'error_orchestration': { label: 'En traitement',        color: 'bg-white/20',    percent: 20  },
  };

  const getFriendlyFeedback = (story) => {
    if (story.status === 'rejected') return story.feedback;
    return null;
  };

  if (showSubmission) {
    return (
      <SubmissionForm
        initialPseudo={userPseudo}
        userUid={user?.uid}
        onBack={() => setShowSubmission(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col gap-6 bg-[#0a0a0a]">

        {/* User identity block */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3">
          {/* Google account badge */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/70">
            <Shield size={10} />
            Compte connecté
          </div>
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-10 h-10 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <User size={20} className="text-emerald-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.displayName || userPseudo}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold tracking-widest uppercase">
              Rang Argent
            </span>
            <span className="text-[10px] text-white/20 font-bold">@{userPseudo}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {[
            { id: 'overview',  label: 'Mon Profil',      icon: User     },
            { id: 'stories',   label: 'Mes Histoires',   icon: FileText },
            { id: 'analytics', label: 'Analytiques',     icon: BarChart3 },
            { id: 'wallet',    label: 'Mon Portefeuille', icon: Wallet   },
            { id: 'settings',  label: 'Paramètres',      icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition text-sm font-medium"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tighter">
              Bienvenue,{' '}
              <span className="text-emerald-400">
                {user?.displayName?.split(' ')[0] || userPseudo}
              </span>
              {' '}👋
            </h1>
            <p className="text-white/40 font-medium text-sm">Tes récits façonnent le futur de la narration antillaise.</p>
          </div>
          <button
            onClick={() => setShowSubmission(true)}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-7 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/10"
          >
            <PlusCircle size={20} />
            Soumettre une histoire
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Chargement du Tableau de Bord...</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/5 border border-white/10 p-7 rounded-3xl flex flex-col gap-2 hover:bg-white/[0.07] transition">
                  <Award className="text-emerald-400 mb-2" size={28} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Badge de Créateur</p>
                  <p className="text-xl font-bold">Explorateur Senior</p>
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-2/3" />
                  </div>
                  <p className="text-[10px] text-white/20 mt-1">2 histoires avant le rang Or</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-7 rounded-3xl flex flex-col gap-2 hover:bg-white/[0.07] transition">
                  <Clock className="text-blue-400 mb-2" size={28} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Histoires soumises</p>
                  <p className="text-4xl font-black">{profile.storiesCount}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-7 rounded-3xl flex flex-col gap-2 hover:bg-white/[0.07] transition">
                  <Wallet className="text-purple-400 mb-2" size={28} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Total Gains (40%)</p>
                  <p className="text-4xl font-black">{profile.balance} €</p>
                </div>

                {latestStory && (
                  <div className="md:col-span-3 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <TrendingUp size={120} />
                    </div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={22} />
                      Dernier Statut
                    </h2>
                    <div className="space-y-5">
                      <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                        <span>{latestStory.title}</span>
                        <span className="text-emerald-400">
                          {statusProgress[latestStory.status]?.label || 'Inconnu'} ({statusProgress[latestStory.status]?.percent || 0}%)
                        </span>
                      </div>
                      <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${statusProgress[latestStory.status]?.percent || 0}%` }}
                          className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {stories.length === 0 && (
                  <div className="md:col-span-3 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center space-y-4">
                    <FileText size={48} className="mx-auto text-white/10" />
                    <p className="text-white/30 font-bold">Pas encore d'histoire soumise.</p>
                    <button
                      onClick={() => setShowSubmission(true)}
                      className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition"
                    >
                      Soumettre ma première histoire
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stories */}
            {activeTab === 'stories' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold mb-6">Historique de mes dépôts</h2>
                {stories.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                    <p className="text-white/20 font-bold italic uppercase tracking-widest">Aucune histoire soumise pour le moment.</p>
                  </div>
                ) : stories.map(story => (
                  <div
                    key={story.id}
                    onClick={() => story.status === 'published' && setSelectedStoryForSheet(story)}
                    className={`relative bg-white/5 border p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition overflow-hidden
                      ${story.status === 'published'
                        ? 'border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 cursor-pointer shadow-lg shadow-emerald-500/5'
                        : 'border-white/10 hover:bg-white/[0.07] cursor-default'
                      }`}
                  >
                    {story.status === 'published' && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                        <Video size={10} /> VOIR LA VIDÉO
                      </div>
                    )}
                    <div className="flex items-center gap-5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        story.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' :
                        story.status === 'rejected'  ? 'bg-red-500/10 text-red-400' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {story.status === 'published' ? <Video size={20} /> :
                         story.status === 'rejected'  ? <AlertCircle size={20} /> :
                         <FileText size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{story.title}</h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          {story.createdAt ? new Date(story.createdAt._seconds * 1000).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1.5">
                      <p className={`text-xs font-bold uppercase tracking-widest ${
                        story.status === 'published' ? 'text-emerald-400' :
                        story.status === 'rejected'  ? 'text-red-400' :
                        'text-white/40'
                      }`}>
                        {statusProgress[story.status]?.label || 'En attente'}
                      </p>
                      {getFriendlyFeedback(story) && (
                        <p className="text-[11px] text-white/30 italic">"{getFriendlyFeedback(story)}"</p>
                      )}
                      {story.status === 'published' && (
                        <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest">Appuie pour ouvrir →</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && <VideoAnalytics pseudo={userPseudo} />}

            {/* Wallet */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 md:p-10 rounded-[2.5rem] text-black shadow-2xl shadow-emerald-500/20">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-60">Solde Disponible</p>
                      <p className="text-5xl font-black mt-1 tracking-tighter">{profile.balance} €</p>
                    </div>
                    <Wallet size={44} className="opacity-40" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition active:scale-95 shadow-lg">
                      Demander un retrait
                    </button>
                    <button className="bg-white/20 border border-white/20 text-black px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                      Stripe Connect
                    </button>
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-widest opacity-40">Seuil de retrait : 50.00 €</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-7 rounded-3xl">
                  <h2 className="text-xl font-bold mb-5">Dernières Transactions</h2>
                  <div className="space-y-3">
                    {stories.filter(s => s.status === 'published').map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="font-bold text-sm">Revenus TikTok</p>
                          <p className="text-xs text-white/40">{s.title} • {s.id.substring(0, 8)}</p>
                        </div>
                        <p className="font-black text-emerald-400">+ 42.10 €</p>
                      </div>
                    ))}
                    {stories.filter(s => s.status === 'published').length === 0 && (
                      <p className="text-white/20 italic text-sm">Aucune transaction pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                {/* Google account card */}
                <div className="bg-white/5 border border-white/8 p-6 rounded-2xl flex items-center gap-4">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                      <User size={28} className="text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-base">{user?.displayName || '—'}</p>
                    <p className="text-xs text-white/40 truncate">{user?.email}</p>
                    <p className="text-[10px] text-emerald-400/60 font-bold mt-1 uppercase tracking-widest">
                      Compte Google vérifié ✓
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight mb-0.5">Paramètres Profil</h2>
                    <p className="text-xs text-white/30">Ton pseudo apparaît sur tes histoires publiées.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Pseudo TikTok / Réseaux</label>
                    <input
                      type="text"
                      id="settings-pseudo"
                      defaultValue={userPseudo}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newPseudo = document.getElementById('settings-pseudo').value.trim();
                      if (newPseudo) {
                        setUserPseudo(newPseudo);
                        localStorage.setItem(pseudoKey, newPseudo);
                        setActiveTab('overview');
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-black transition shadow-xl shadow-emerald-500/10"
                  >
                    METTRE À JOUR LE PSEUDO
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedStoryForSheet && (
          <TiktokSheet story={selectedStoryForSheet} onBack={() => setSelectedStoryForSheet(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
