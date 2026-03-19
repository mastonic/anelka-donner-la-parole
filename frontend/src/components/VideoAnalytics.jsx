import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Heart, Share2, DollarSign, Loader2, Calendar } from 'lucide-react';

const VideoAnalytics = ({ pseudo }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics?pseudo=${pseudo}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [pseudo]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">Analyse des données en cours...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
        <TrendingUp size={40} />
        <p className="font-bold uppercase tracking-widest text-xs">Données analytiques indisponibles.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Vues Totales', value: data.views.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Interactions', value: data.likes.toLocaleString(), icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Partages', value: data.shares.toLocaleString(), icon: Share2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Revenus Est.', value: `${data.revenue.toFixed(2)} €`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Performances Vidéos</h2>
          <p className="text-white/40 text-sm font-medium">Analyse temps réel de ton impact sur TikTok.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-white/60">
          <Calendar size={14} />
          Derniers 7 jours
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.08] transition"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tabular-nums">{stat.value}</p>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition">
              <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart (Mockup simplified with SVG) */}
      <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative overflow-hidden">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              Courbe de Croissance
            </h3>
            <p className="text-xs text-white/30 font-bold uppercase mt-1">Évolution des vues journalières</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400">+{data.engagementRate}%</p>
            <p className="text-[10px] text-white/20 font-bold uppercase">Taux d'engagement</p>
          </div>
        </div>

        <div className="h-64 w-full relative group">
          <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="1000" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="0" y1="50" x2="1000" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            
            {/* Line Chart */}
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              d="M 0,180 L 150,165 L 300,150 L 450,120 L 600,140 L 750,80 L 900,100 L 1000,20"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Points */}
            {[0, 150, 300, 450, 600, 750, 900, 1000].map((x, i) => {
              const ys = [180, 165, 150, 120, 140, 80, 100, 20];
              return (
                <circle key={i} cx={x} cy={ys[i]} r="4" className="fill-white group-hover:r-6 transition duration-300" />
              )
            })}
          </svg>
          
          <div className="flex justify-between mt-6 text-[10px] font-black uppercase tracking-widest text-white/20">
            {data.history.map((h, i) => (
              <span key={i}>{h.date.split('-')[2]} Mar</span>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Recap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
          <h4 className="text-emerald-400 font-bold mb-4 uppercase text-xs tracking-widest">Points Forts</h4>
          <ul className="space-y-3 text-sm font-medium text-white/60">
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Retention rate exceptionnelle sur les 3 premières secondes.</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> L'audience 18-24 ans représente 65% de tes vues.</li>
          </ul>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2.5rem]">
          <h4 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-widest">Optimisation</h4>
          <ul className="space-y-3 text-sm font-medium text-white/60">
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Augmente l'usage des CTAs en milieu de vidéo.</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Teste des formats plus courts (45-60s) le weekend.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalytics;
