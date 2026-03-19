import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Settings, LogOut, ChevronLeft, PlusCircle, Wallet, Award, Clock, CheckCircle2, AlertCircle, TrendingUp, Loader2, BarChart3, Video } from 'lucide-react';
import SubmissionForm from './SubmissionForm';
import TiktokSheet from './TiktokSheet';
import VideoAnalytics from './VideoAnalytics';

const ClientDashboard = ({ onBack }) => {
  const [userPseudo, setUserPseudo] = useState(localStorage.getItem('userPseudo') || 'Dolu');
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmission, setShowSubmission] = useState(false);
  const [selectedStoryForSheet, setSelectedStoryForSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    pseudo: userPseudo,
    storiesCount: 0,
    balance: '0.00',
    stories: []
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/profile/${userPseudo}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Fetch profile failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [showSubmission, userPseudo]); // Refetch when pseudo changes

  const stories = profile.stories || [];
  const latestStory = stories.length > 0 ? stories[0] : null;

  const statusProgress = {
    'wait': { label: 'En attente', color: 'bg-white/20', percent: 20 },
    'analysis': { label: 'En cours d\'analyse', color: 'bg-blue-400', percent: 40 },
    'selected': { label: 'Sélectionnée', color: 'bg-purple-400', percent: 60 },
    'generating_script': { label: 'Script en cours', color: 'bg-yellow-400', percent: 65 },
    'generating_images': { label: 'Images en cours', color: 'bg-yellow-400', percent: 70 },
    'validée': { label: 'En production', color: 'bg-yellow-400', percent: 80 },
    'production': { label: 'En production', color: 'bg-yellow-400', percent: 80 },
    'published': { label: 'Publiée', color: 'bg-emerald-400', percent: 100 },
    'rejected': { label: 'Non retenue', color: 'bg-red-400', percent: 0 },
    'error_production': { label: 'En cours de traitement', color: 'bg-white/20', percent: 20 },
    'error_orchestration': { label: 'En cours de traitement', color: 'bg-white/20', percent: 20 },
  };

  // Ne jamais afficher les erreurs techniques brutes aux clients
  const getFriendlyFeedback = (story) => {
    if (!story.feedback) return null;
    if (story.status === 'rejected') return story.feedback;
    return null; // Les erreurs techniques sont masquées
  };

  if (showSubmission) {
    return <SubmissionForm initialPseudo={userPseudo} onBack={() => setShowSubmission(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <User size={24} className="text-black" />
          </div>
          <div>
            <span className="font-bold block">Artiste {userPseudo}</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold tracking-widest uppercase">Rang Argent</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Mon Profil', icon: User },
            { id: 'stories', label: 'Mes Histoires', icon: FileText },
            { id: 'analytics', label: 'Analytiques', icon: BarChart3 },
            { id: 'wallet', label: 'Mon Portefeuille', icon: Wallet },
            { id: 'settings', label: 'Paramètres', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={onBack}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition text-sm font-medium"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Bienvenue, <span className="text-emerald-400">{userPseudo}</span></h1>
            <p className="text-white/40 font-medium">Tes récits façonnent le futur de la narration.</p>
          </div>
          <button 
            onClick={() => setShowSubmission(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/10"
          >
            <PlusCircle size={22} />
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
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col gap-2 group hover:bg-white/[0.07] transition">
                  <Award className="text-emerald-400 mb-2" size={32} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Badge de Créateur</p>
                  <p className="text-2xl font-bold">Explorateur Senior</p>
                  <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-2/3"></div>
                  </div>
                  <p className="text-[10px] text-white/20 mt-1">2 histoires avant le rang Or</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col gap-2 group hover:bg-white/[0.07] transition">
                  <Clock className="text-blue-400 mb-2" size={32} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Histoires soumises</p>
                  <p className="text-4xl font-black">{profile.storiesCount}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col gap-2 group hover:bg-white/[0.07] transition">
                  <Wallet className="text-purple-400 mb-2" size={32} />
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Total Gains (40%)</p>
                  <p className="text-4xl font-black">{profile.balance} €</p>
                </div>

                {latestStory && (
                  <div className="md:col-span-3 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] mt-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <TrendingUp size={120} />
                    </div>
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                      Dernier Statut
                    </h2>
                    <div className="space-y-6">
                      <div className="flex justify-between text-sm font-bold uppercase tracking-widest mb-2">
                        <span className="text-white">{latestStory.title}</span>
                        <span className="text-emerald-400">{statusProgress[latestStory.status]?.label || 'Inconnu'} ({statusProgress[latestStory.status]?.percent || 0}%)</span>
                      </div>
                      <div className="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${statusProgress[latestStory.status]?.percent || 0}%` }}
                          className="h-full bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-2 pt-4">
                        {Object.keys(statusProgress).filter(k=>k!=='rejected').map((key, i) => (
                            <div key={key} className="flex flex-col items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${statusProgress[latestStory.status]?.percent >= statusProgress[key]?.percent ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-white/10'}`}></div>
                              <span className="text-[10px] text-white/40 text-center font-bold uppercase">{statusProgress[key].label}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-8">Historique des dépôts</h2>
                <div className="grid gap-4">
                  {stories.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                      <p className="text-white/20 font-bold italic uppercase tracking-widest">Aucune histoire soumise pour le moment.</p>
                    </div>
                  ) : stories.map(story => (
                    <div key={story.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white/[0.08] transition">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${story.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           {story.status === 'rejected' ? <AlertCircle size={24} /> : <FileText size={24} />}
                        </div>
                        <div>
                           <h3 className="font-bold text-lg">{story.title}</h3>
                           <p className="text-sm text-white/40">{story.createdAt ? new Date(story.createdAt._seconds * 1000).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                        </div>
                      </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="text-right">
                              <p className={`text-xs font-bold uppercase tracking-widest ${story.status === 'rejected' ? 'text-red-400' : 'text-emerald-400'}`}>
                                 {statusProgress[story.status]?.label || 'En attente'}
                              </p>
                              {getFriendlyFeedback(story) && (
                                <p className="text-[11px] text-white/30 mt-1 max-w-[200px] italic">
                                   "{getFriendlyFeedback(story)}"
                                </p>
                              )}
                           </div>
                           
                           {story.status === 'published' && (
                             <button 
                               onClick={() => setSelectedStoryForSheet(story)}
                               className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition"
                             >
                               <Video size={12} />
                               Fiche TikTok
                             </button>
                           )}
                        </div>
                        <ChevronLeft size={20} className="rotate-180 text-white/20" />
                      </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
               <VideoAnalytics pseudo={userPseudo} />
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-10 rounded-[3rem] text-black shadow-2xl shadow-emerald-500/20">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                       <p className="text-sm font-bold uppercase tracking-widest opacity-60">Solde Disponible</p>
                       <p className="text-6xl font-black mt-2 tracking-tighter">{profile.balance} €</p>
                    </div>
                    <Wallet size={48} className="opacity-40" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-black text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition active:scale-95 shadow-lg">
                       Demander un retrait
                    </button>
                    <button className="bg-white/20 border border-white/20 text-black px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 backdrop-blur-md">
                       Stripe Connect
                    </button>
                  </div>
                  <p className="mt-6 text-[11px] font-bold uppercase tracking-widest opacity-40">Seuil de retrait : 50.00 €</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <h2 className="text-xl font-bold mb-6">Dernières Transactions</h2>
                  <div className="space-y-4">
                    {stories.filter(s => s.status === 'published').map((s, i) => (
                       <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                          <div>
                             <p className="font-bold">Revenus TikTok</p>
                             <p className="text-xs text-white/40">{s.title} • {s.id.substring(0, 8)}</p>
                          </div>
                          <p className="font-black text-emerald-400 text-lg">+ 42.10 €</p>
                       </div>
                    ))}
                    {stories.filter(s => s.status === 'published').length === 0 && (
                      <p className="text-white/20 italic text-sm">Aucune transaction pour le moment.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <Settings size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter">Paramètres Profil</h2>
                      <p className="text-xs text-white/30 font-bold tracking-widest uppercase">Gère ton identité de créateur</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/40">Pseudo TikTok / Réseaux</label>
                      <input 
                          type="text" 
                          id="settings-pseudo"
                          defaultValue={userPseudo}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-white/40">Email de contact</label>
                      <input 
                          type="email" 
                          placeholder={`${userPseudo.toLowerCase()}@example.com`}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                    <div className="pt-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dolu" alt="avatar" />
                      </div>
                      <button className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition">
                          Changer l'avatar
                      </button>
                    </div>
                </div>

                 <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={() => {
                        const newPseudo = document.getElementById('settings-pseudo').value;
                        if (newPseudo) {
                          setUserPseudo(newPseudo);
                          localStorage.setItem('userPseudo', newPseudo);
                          alert('[V2] Profil mis à jour !');
                          setActiveTab('overview');
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-emerald-500/10"
                    >
                      METTRE À JOUR LE PROFIL
                    </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AnimatePresence>
        {selectedStoryForSheet && (
          <TiktokSheet 
            story={selectedStoryForSheet} 
            onBack={() => setSelectedStoryForSheet(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
