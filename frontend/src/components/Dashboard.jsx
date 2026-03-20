import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Loader2, Sparkles, AlertCircle, ChevronLeft, LayoutDashboard, FileEdit, PieChart, ShieldAlert, ScrollText, Image as ImageIcon, Check, X, CheckCircle, Server, User, Video } from 'lucide-react';
import ProgressBar from './ProgressBar';
import AdminCrible from './AdminCrible';
import TiktokSheet from './TiktokSheet';
import TiktokLiveSheet from './TiktokLiveSheet';
import VideoAnalytics from './VideoAnalytics';

const VoiceRefUploader = () => {
  const [status, setStatus] = React.useState(null); // null | 'uploading' | 'done' | 'error'
  const [info, setInfo] = React.useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('uploading');
    setInfo('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload-voice-ref', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('done');
      setInfo(`✅ ${file.name} — ${Math.round(data.size / 1024)} KB uploadé.`);
    } catch (err) {
      setStatus('error');
      setInfo(err.message);
    }
  };

  return (
    <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dashed cursor-pointer transition
      ${status === 'done' ? 'border-emerald-500/40 bg-emerald-500/5' : status === 'error' ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
      <input type="file" accept="audio/*" className="hidden" onChange={handleFile} />
      {status === 'uploading' ? (
        <Loader2 className="animate-spin text-purple-400" size={24} />
      ) : (
        <Server size={24} className={status === 'done' ? 'text-emerald-400' : 'text-white/20'} />
      )}
      <p className="text-xs font-black uppercase tracking-widest text-white/40">
        {status === 'uploading' ? 'Upload en cours...' : status === 'done' ? 'Référence mise à jour' : 'Déposer le fichier audio (MP3, max 50s)'}
      </p>
      {info && <p className="text-[10px] text-center text-white/40 italic">{info}</p>}
    </label>
  );
};

const Dashboard = ({ onBack, onViewClient }) => {
  const [activeTab, setActiveTab] = useState('crible');
  const [topic, setTopic] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [script, setScript] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [studioView, setStudioView] = useState('production'); // 'production' | 'tiktok'
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalStories: 0,
    pendingValidations: 0,
    totalRevenue: '0.00',
    activeAgents: 0
  });

  const [hiddenStoryIds, setHiddenStoryIds] = useState(new Set());

  const hideStory = (id) => setHiddenStoryIds(prev => new Set([...prev, id]));
  const clearFinished = () => {
    const finishedIds = (stats.recentStories || [])
      .filter(s => s.status === 'published' || s.status?.startsWith('error'))
      .map(s => s.id);
    setHiddenStoryIds(prev => new Set([...prev, ...finishedIds]));
  };

  const [config, setConfig] = useState({
    openai: '',
    google: '',
    fal: '',
    fish: ''
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      } else {
        console.error("Fetch stats returned error:", data);
      }
    } catch (err) {
      console.error("Fetch stats failed:", err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data && !data.error) {
        setConfig(prev => ({
            ...prev,
            ...data
        }));
      }
    } catch (err) {
      console.error("Fetch config failed:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchConfig();
    // Simulate some real-ish logs
    setLogs([
      { time: '14:02:11', type: 'scout', msg: "SCOUT ACTIVE: Recherche tendances TikTok 'Antilles Lifestyle'..." },
      { time: '14:05:45', type: 'curator', msg: "CURATOR: Analyse de l'histoire #9012 - Score Virilité 95%" },
      { time: '14:06:02', type: 'curator', msg: "CURATOR: Script généré en Français (Martinican Style)" },
      { time: '14:10:33', type: 'visual', msg: "VISUAL: Storyboard JSON créé (12 frames)" },
      { time: '14:15:20', type: 'engine', msg: "FAL_PROXY: Requête VEO envoyée pour Frame 1" }
    ]);
  }, []);

  useEffect(() => {
    if (selectedStory) {
      const fetchStoryDetails = async () => {
        try {
          const res = await fetch(`/api/stories?id=${selectedStory}`);
          const data = await res.json();
          // Assuming the list returns the story if id matches
          const story = Array.isArray(data) ? data.find(s => s.id === selectedStory) : data;
          if (story) {
            setStoryData(story);
            setScript(story.script || story.content || "");
          }
        } catch (err) {
          console.error("Failed to fetch story details:", err);
        }
      };
      fetchStoryDetails();
    }
  }, [selectedStory]);

  const startGeneration = async () => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setJobId(data.jobId);
    } catch (err) {
      console.error(err);
    }
  };

  const [errorMsg, setErrorMsg] = useState(null);
  const [isRetriggering, setIsRetriggering] = useState(false);

  const retriggerVM = async (storyId) => {
    try {
      setIsRetriggering(true);
      const res = await fetch('/api/production/retrigger-vm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur retrigger VM');
      // Status will update via polling
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsRetriggering(false);
    }
  };

  const startProduction = async (storyId) => {
    try {
      setStatus('generating');
      setErrorMsg(null);
      const res = await fetch('/api/production/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue lors du lancement");
      }

      setJobId(data.jobId);
      // Ne pas forcer 'completed' ici - le polling Firestore met à jour le statut réel
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  // Poll for status updates when a story is in production
  useEffect(() => {
    let interval;
    if (selectedStory && (status === 'generating' || status === 'generating_script' || status === 'generating_images' || status === 'completed')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/stories?id=${selectedStory}`);
          const data = await res.json();
          const story = Array.isArray(data) ? data.find(s => s.id === selectedStory) : data;
          
          if (story) {
            // Update story data in case images were just added
            if (story.segments) setStoryData(story);
            
            // Update local status based on Firestore status
            if (story.status === 'generating_script') setStatus('generating_script');
            if (story.status === 'generating_images') setStatus('generating_images');
            if (story.status === 'validée') setStatus('completed');
            if (story.status === 'published') setStatus('published');
            
            if (story.status === 'error_production' || story.status === 'error_orchestration') {
                setStatus('error');
                setErrorMsg(story.feedback || story.error || "Une erreur est survenue lors de l'orchestration GCP.");
                clearInterval(interval);
            }

            // Populate script editor with curated text if available
            if (story.script && Array.isArray(story.script)) {
               const fullScript = story.script.map(s => s.text).join('\n\n');
               if (fullScript !== script) setScript(fullScript);
            } else if (story.content && !story.script && story.content !== script) {
               setScript(story.content);
            }
          }

          // Also fetch job data if we are in 'completed' (validée) but not 'published' yet
          if (story?.status === 'validée') {
            const jobRes = await fetch(`/api/jobs/${selectedStory}`);
            const job = await jobRes.json();
            if (job && !job.error) setJobData(job);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedStory, status]);

  const saveConfig = async (newKeys) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeys),
      });
      setConfig(prev => ({ ...prev, ...newKeys }));
      alert('Configuration enregistrée !');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold block">Command Center</span>
            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">Admin Mode</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'crible', label: 'Le Crible', icon: ShieldAlert },
            { id: 'studio', label: 'Studio Validation', icon: FileEdit },
            { id: 'analytics', label: 'Analytiques Vidéos', icon: PieChart },
            { id: 'splitter', label: 'Splitter Financier', icon: PieChart },
            { id: 'logs', label: 'Journal des Logs', icon: ScrollText },
            { id: 'settings', label: 'Paramètres API', icon: ShieldAlert },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === item.id ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          {onViewClient && (
            <button
              onClick={onViewClient}
              className="flex items-center gap-3 px-4 py-3 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition text-sm font-medium rounded-xl"
            >
              <User size={18} />
              Vue Client
            </button>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Retour Landing
          </button>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter uppercase">
               {activeTab === 'crible' && 'Le Crible AI'}
               {activeTab === 'studio' && 'Studio Dolu'}
               {activeTab === 'analytics' && 'Performances Antillaises'}
               {activeTab === 'splitter' && 'Splitter Financier'}
               { activeTab === 'logs' && 'Logs Agents' }
               { activeTab === 'settings' && 'Paramètres Système' }
            </h1>
            {activeTab === 'studio' && selectedStory && (
               <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">Édition & Production en cours</p>
            )}
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{stats.activeAgents} Agents Online</span>
          </div>
        </header>

        {activeTab === 'crible' && (
          <AdminCrible 
             onLaunchProd={(id) => {
                setSelectedStory(id);
                setActiveTab('studio');
             }} 
          />
        )}

        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Historique Prods</h3>
                  <button
                    onClick={clearFinished}
                    className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/20"
                    title="Masquer les publiées et erreurs"
                  >
                    Vider terminés
                  </button>
                </div>
                <div className="space-y-2 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                   {stats.recentStories?.filter(s => !hiddenStoryIds.has(s.id)).map((s) => (
                      <div
                        key={s.id}
                        className={`relative group w-full p-4 rounded-2xl border text-left transition ${selectedStory === s.id ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}
                      >
                        <button
                          onClick={() => setSelectedStory(s.id)}
                          className="w-full text-left"
                        >
                          <p className="font-bold text-sm truncate pr-5">{s.title || s.content?.substring(0, 20)}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${s.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : s.status === 'error_production' ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white/40'}`}>
                              {s.status === 'validée' ? 'En attente VM' : s.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-white/20 font-bold">{new Date(s.createdAt?._seconds * 1000).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </button>
                        {/* Delete/hide button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); hideStory(s.id); }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10"
                          title="Masquer cette entrée"
                        >
                          <X size={12} />
                        </button>
                      </div>
                   ))}
                   {(stats.recentStories?.filter(s => !hiddenStoryIds.has(s.id)).length === 0) && (
                     <div className="text-center py-8 text-white/20">
                       <p className="text-xs font-bold uppercase tracking-widest">Liste vide</p>
                       <button onClick={() => setHiddenStoryIds(new Set())} className="mt-2 text-[10px] text-white/30 hover:text-white/60 transition underline">
                         Tout afficher
                       </button>
                     </div>
                   )}
                </div>
             </div>

             <div className="lg:col-span-6 space-y-6">

                {/* View tabs */}
                {selectedStory && (
                  <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                    <button
                      onClick={() => setStudioView('production')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                        studioView === 'production' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      <FileEdit size={14} />
                      Production
                    </button>
                    <button
                      onClick={() => setStudioView('tiktok')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                        studioView === 'tiktok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      <Video size={14} />
                      Fiche Vidéo
                    </button>
                    <button
                      onClick={() => setStudioView('live')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition ${
                        studioView === 'live' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      Live TikTok
                    </button>
                  </div>
                )}

                {/* Fiche Vidéo tab */}
                {selectedStory && studioView === 'tiktok' && storyData && (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem]">
                    <TiktokSheet story={storyData} inline />
                  </div>
                )}
                {selectedStory && studioView === 'tiktok' && !storyData && (
                  <div className="flex flex-col items-center justify-center p-16 gap-4 text-white/20">
                    <Video size={40} className="animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest">Sélectionne une histoire avec une vidéo publiée</p>
                  </div>
                )}

                {/* Live TikTok tab */}
                {selectedStory && studioView === 'live' && (
                  <div className="overflow-y-auto max-h-[80vh] pr-1">
                    <TiktokLiveSheet story={storyData || { title: '', pseudo: '' }} />
                  </div>
                )}

                {/* Production tab content */}
                {(!selectedStory || studioView === 'production') && selectedStory && (
                   <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex justify-between items-center overflow-x-auto gap-4 scrollbar-hide">
                      {[
                        { label: 'Script', status: status === 'generating_script' ? 'active' : (status === 'generating_images' || status === 'completed' || status === 'published' ? 'done' : 'idle') },
                        { label: 'Assets', status: status === 'generating_images' ? 'active' : (status === 'completed' || status === 'published' ? 'done' : 'idle') },
                        { label: 'Cloud VM', status: (status === 'completed' && jobData?.status === 'queued') ? 'active' : (status === 'published' || (status === 'completed' && jobData?.vmStatus === 'running') ? 'done' : 'idle') },
                        { label: 'Rendu', status: (status === 'completed' && jobData?.vmStatus === 'running') ? 'active' : (status === 'published' ? 'done' : 'idle') },
                        { label: 'Publié', status: status === 'published' ? 'done' : 'idle' }
                      ].map((step, i, arr) => (
                        <React.Fragment key={i}>
                           <div className="flex flex-col items-center gap-2 min-w-[70px]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                                step.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-black' : 
                                step.status === 'active' ? 'border-purple-500 text-purple-500 animate-pulse' : 
                                'border-white/10 text-white/20'
                              }`}>
                                 {step.status === 'done' ? <Check size={16} /> : <span className="text-[10px] font-bold">{i+1}</span>}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'active' ? 'text-purple-400' : 'text-white/20'}`}>{step.label}</span>
                           </div>
                           {i < arr.length - 1 && <div className={`h-[1px] flex-1 min-w-[20px] ${step.status === 'done' ? 'bg-emerald-500' : 'bg-white/10'}`}></div>}
                        </React.Fragment>
                      ))}
                   </div>
                )}

                {studioView === 'production' && <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                         {status === 'published' ? <Play className="text-emerald-400" size={20} /> : <FileEdit className="text-purple-400" size={20} />}
                         {status === 'published' ? 'Production Finale' : 'Script de l\'histoire'}
                      </h2>
                      {status === 'published' && (
                        <div className="px-4 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest">PUBLIÉ</div>
                      )}
                   </div>

                   {status === 'published' && storyData?.videoUrl ? (
                      <div className="aspect-[9/16] max-w-[300px] mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 mt-4">
                         <video 
                            src={storyData.videoUrl} 
                            controls 
                            className="w-full h-full object-cover"
                            poster={storyData.segments?.[0]?.img_url}
                         />
                      </div>
                   ) : (status === 'completed' || status === 'validée') ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-3xl border border-white/5 border-dashed min-h-[400px] space-y-8">
                         <div className="relative">
                            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                               <Server className="text-purple-400" size={40} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 text-black rounded-full flex items-center justify-center animate-bounce shadow-lg">
                               <Check size={16} />
                            </div>
                         </div>
                         <div className="text-center space-y-2">
                             <h3 className="text-3xl font-black uppercase tracking-tighter">Production Cloud Active</h3>
                             <p className="text-sm text-white/40 max-w-[400px] leading-relaxed">Ton histoire est actuellement sur le banc de montage Google Cloud GPU. Le rendu vidéo et l'audio cloné sont en cours de création.</p>
                         </div>
                         <div className="w-full max-w-sm p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Statut du Serveur</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${jobData?.vmStatus === 'running' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/60'}`}>
                                   {jobData?.vmStatus?.toUpperCase() || 'INITIALisation...'}
                                </span>
                             </div>
                             <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                                <motion.div 
                                    className="h-full bg-emerald-500"
                                    initial={{ width: '5%' }}
                                    animate={{ width: jobData?.vmStatus === 'starting' ? '30%' : jobData?.vmStatus === 'running' ? '70%' : (jobData?.status === 'completed' ? '100%' : '15%') }}
                                />
                             </div>
                             <p className="text-[10px] text-white/30 italic text-center">
                                {jobData?.vmStatus === 'starting' && "Prise en charge par GCP (Machine NVIDIA L4)..."}
                                {jobData?.vmStatus === 'running' && "Rendu FFmpeg + VEO en cours..."}
                                {!jobData?.vmStatus && "Attente de l'ordre d'exécution Cloud..."}
                             </p>
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-4">
                        <textarea 
                           value={script}
                           onChange={(e) => setScript(e.target.value)}
                           placeholder="Sélectionne une histoire pour commencer..."
                           className="w-full h-[400px] bg-black/40 border border-white/5 border-dashed rounded-3xl p-8 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-purple-500 font-mono resize-none transition"
                        ></textarea>
                      </div>
                   )}
                </div>}

                {studioView === 'production' && <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <ImageIcon className="text-purple-400" size={20} />
                      Storyboard Preview
                   </h2>
                   <div className="grid grid-cols-4 gap-4">
                      {storyData?.segments?.length > 0 ? storyData.segments.map((seg, i) => (
                        <div key={i} className="aspect-square bg-black/40 rounded-xl border border-white/5 flex items-center justify-center group relative overflow-hidden">
                          {seg.img_url ? (
                            <>
                              <img
                                src={seg.img_url}
                                alt={`Frame ${i+1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}
                              />
                              <div className="hidden absolute inset-0 flex-col items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-white/10" size={16} />
                                <span className="text-[10px] text-white/20 select-none">Asset {i+1}...</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="animate-spin text-white/10" size={16} />
                              <span className="text-[10px] text-white/20 select-none">Asset {i+1}...</span>
                            </div>
                          )}
                        </div>
                      )) : [1,2,3,4].map(i => (
                         <div key={i} className="aspect-square bg-black/40 border border-white/5 border-dashed rounded-xl flex items-center justify-center">
                            <span className="text-xs text-white/10 select-none">Asset {i}</span>
                         </div>
                      ))}
                   </div>
                </div>}
             </div>

             <aside className="lg:col-span-3 space-y-6">
                <div className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-purple-500/20">
                    <p className="text-sm opacity-60 mb-8 font-medium">Configure et valide la production pour lancer les agents de rendu.</p>
                    
                    <div className="mb-6 space-y-3">
                        {status === 'generating' && (
                            <div className="flex items-center gap-2 text-white text-xs font-bold animate-pulse">
                                <Loader2 className="animate-spin" size={14} /> INITIALISATION...
                            </div>
                        )}
                        {(status === 'generating_script' || status === 'generating_images') && (
                            <div className="p-4 bg-white/10 rounded-2xl space-y-3">
                               <div className="flex justify-between text-[10px] font-black uppercase">
                                  <span>Génération {status === 'generating_script' ? 'Script' : 'Images'}</span>
                                  <span>En cours...</span>
                               </div>
                               <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                  <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-1/2 bg-white" />
                                </div>
                            </div>
                        )}
                        {status === 'completed' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                                   <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                                      <span className="text-emerald-400">VM Status</span>
                                      <span className="px-2 py-0.5 bg-emerald-500 text-black rounded">{jobData?.vmStatus || 'READY'}</span>
                                   </div>
                                   <p className="text-[10px] text-white/50 leading-relaxed italic">
                                      {jobData?.vmStatus === 'starting' && "Le serveur GPU H100 est en cours d'allumage..."}
                                      {jobData?.vmStatus === 'running' && "Rendu FFmpeg en direct sur les couches Cloud."}
                                      {!jobData?.vmStatus && "Script & Images validés avec succès."}
                                   </p>
                                   {jobData?.logs?.length > 0 && (
                                     <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[9px] max-h-[120px] overflow-y-auto">
                                        <div className="text-purple-400 mb-2 font-bold uppercase tracking-widest text-[8px]">Logs Système VM</div>
                                        {jobData.logs.map((log, i) => (
                                          <div key={i} className="text-white/40 mb-1 border-l border-white/10 pl-2">{log}</div>
                                        ))}
                                     </div>
                                   )}
                                   {/* Relancer la VM si elle ne tourne pas */}
                                   {(!jobData?.vmStatus || jobData?.vmStatus === 'waiting_queue') && (
                                     <button
                                       onClick={() => retriggerVM(selectedStory)}
                                       disabled={isRetriggering}
                                       className="w-full mt-3 bg-orange-500 hover:bg-orange-400 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50"
                                     >
                                       {isRetriggering ? <Loader2 className="animate-spin" size={14} /> : <Server size={14} />}
                                       {isRetriggering ? 'Relance en cours...' : '⚡ Relancer la VM'}
                                     </button>
                                   )}
                                </div>
                            </div>
                        )}
                        {status === 'published' && (
                             <button 
                                onClick={() => setShowSheet(true)}
                                className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-105 transition"
                             >
                                <Download size={20} /> TÉLÉCHARGER
                             </button>
                        )}
                        {status === 'error' && (
                            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                                <p className="text-[10px] text-red-300 font-bold uppercase mb-1">Erreur</p>
                                <p className="text-[10px] opacity-70">{errorMsg}</p>
                            </div>
                        )}
                    </div>

                    {status !== 'published' && (
                      <button 
                         onClick={() => selectedStory && startProduction(selectedStory)}
                         disabled={!selectedStory || status?.startsWith('generating') || status === 'completed' || status === 'validée'}
                         className={`w-full py-4 rounded-2xl font-black text-lg hover:scale-105 transition shadow-xl disabled:opacity-50 ${status === 'completed' || status === 'validée' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white text-purple-600'}`}
                      >
                         {status === 'completed' || status === 'validée' ? 'PRODUCTION EN COURS...' : (status === 'error' ? 'RÉESSAYER' : 'LANCER LA PROD')}
                      </button>
                    )}
                    <div className="mt-4 text-[8px] text-white/5 uppercase font-bold tracking-widest text-center">
                       DEBUG: {status || 'null'} | STORY: {selectedStory || 'none'}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Paramètres Audio</h3>
                   <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                         <Play size={18} fill="currentColor" />
                      </div>
                      <div>
                         <p className="text-xs font-bold">Fish Speech - Dolu V1</p>
                         <p className="text-[10px] text-white/30">Modèle: Antillais Premium</p>
                      </div>
                   </div>
                </div>
             </aside>
          </div>
        )}

        {activeTab === 'analytics' && (
           <VideoAnalytics pseudo="Dolu" />
        )}

        {activeTab === 'splitter' && (
          <div className="space-y-8">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
                <h2 className="text-2xl font-black mb-8">Répartition des Revenus</h2>
                <div className="flex items-center gap-12 mb-12">
                   <div className="w-48 h-48 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="4"></circle>
                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="4" strokeDasharray={`${stats.followerRevenuePercentage} 100`}></circle>
                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-purple-500" strokeWidth="4" strokeDasharray={`${stats.doluRevenuePercentage} 100`} strokeDashoffset={`-${stats.followerRevenuePercentage}`}></circle>
                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray={`${stats.apiRevenuePercentage} 100`} strokeDashoffset={`-${stats.followerRevenuePercentage + stats.doluRevenuePercentage}`}></circle>
                      </svg>
                       <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <p className="text-[10px] text-white/30 font-bold uppercase">Total</p>
                          <p className="text-lg font-black">{stats.totalRevenue} €</p>
                       </div>
                   </div>
                   <div className="flex-1 space-y-6">
                      {[
                        { label: 'Follower (Histoire)', part: `${stats.followerRevenuePercentage}%`, color: 'bg-emerald-500' },
                        { label: 'DOLUANELKA (Narration)', part: `${stats.doluRevenuePercentage}%`, color: 'bg-purple-500' },
                        { label: 'Gestion & APIs (Toi)', part: `${stats.apiRevenuePercentage}%`, color: 'bg-blue-500' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                           <div className="flex items-center gap-3 font-bold">
                              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                              <span>{item.label}</span>
                           </div>
                           <span className="text-xl font-black">{item.part}</span>
                        </div>
                      ))}
                   </div>
                </div>
                <button className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                   <PieChart size={20} />
                   Importer Rapport TikTok (.csv)
                </button>
             </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-black/40 border border-white/5 rounded-3xl p-8 h-[500px] overflow-y-auto font-mono text-xs">
             <div className="space-y-2">
                {logs.map((log, i) => (
                  <p key={i} className={`${log.type === 'scout' ? 'text-emerald-400' : log.type === 'curator' ? 'text-purple-400' : 'text-blue-400'}`}>
                    [{log.time}] {log.msg}
                  </p>
                ))}
                <p className="text-white/20">[{new Date().toLocaleTimeString('fr-FR')}] SYSTEM: Session en direct. En attente d'événements.</p>
             </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center">
                   <ShieldAlert size={28} />
                </div>
                <div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter">Gestion des Clés API</h2>
                   <p className="text-xs text-white/30 font-bold tracking-widest uppercase">Configuration Globale de la Plateforme</p>
                </div>
             </div>

             <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    saveConfig(config);
                }}
                className="space-y-6"
             >
                {[
                  { id: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', desc: 'Utilisée pour la génération des scripts (GPT-4o).' },
                  { id: 'google', label: 'Google GenAI Key', placeholder: 'AIza...', desc: 'Utilisée pour Gemini 2.5 (TTS & Agents).' },
                  { id: 'fal', label: 'Fal.ai API Key', placeholder: 'Key-...', desc: 'Utilisée pour FLUX (Génération d\'images).' },
                  { id: 'fish', label: 'Fish Speech Key', placeholder: 'FS-...', desc: 'Utilisée pour le clonage de voix premium.' }
                ].map(api => (
                  <div key={api.id} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40">{api.label}</label>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config[api.id] ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/20 bg-white/5'}`}>
                           {config[api.id] ? 'Configuré' : 'Non défini'}
                        </span>
                     </div>
                     <input 
                        id={`${api.id}-key`}
                        type="password" 
                        value={config[api.id] || ''}
                        onChange={(e) => setConfig({...config, [api.id]: e.target.value})}
                        placeholder={api.placeholder}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-purple-500 transition"
                     />
                     <p className="text-[10px] text-white/20 font-medium italic">{api.desc}</p>
                  </div>
                ))}

                <div className="pt-6 border-t border-white/5">
                    <button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-purple-600/20"
                    >
                       ENREGISTRER LA CONFIGURATION
                    </button>
                    <p className="text-center mt-4 text-[10px] text-white/20 uppercase font-bold tracking-widest">Ces clés sont partagées avec tous les clients de la plateforme.</p>
                </div>
             </form>

             {/* Voice Reference Upload */}
             <div className="pt-8 border-t border-white/5 space-y-4">
               <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Voix de Référence (Clonage)</h3>
                 <p className="text-[10px] text-white/20 mt-1 italic">Fichier audio de Dolunaelka — 30 à 50 sec, MP3, voix seule sans musique de fond.</p>
               </div>
               <VoiceRefUploader />
             </div>
          </div>
        )}
      </main>

      {/* Sheet Modal */}
      {showSheet && storyData && (
        <TiktokSheet 
          story={storyData} 
          onBack={() => setShowSheet(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
