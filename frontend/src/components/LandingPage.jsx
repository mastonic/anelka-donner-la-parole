import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, Users, Play, Star, Plus, Minus, MessageSquare, BookOpen, Crown, ChevronRight, Menu, X } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-5 sm:py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group gap-4"
      >
        <span className="text-base sm:text-lg font-bold group-hover:text-emerald-400 transition">{question}</span>
        {isOpen ? <Minus size={18} className="text-emerald-400 shrink-0" /> : <Plus size={18} className="text-white/20 shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-white/40 leading-relaxed text-sm sm:text-base">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ onStartClient, onStartAdmin, user, isAdmin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-emerald-500/30 font-sans">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap size={18} className="text-black sm:hidden" />
              <Zap size={22} className="text-black hidden sm:block" />
            </div>
            <span className="text-sm sm:text-base md:text-xl font-black tracking-tighter uppercase">Donner La Parole</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <a href="#how" className="text-sm font-bold text-white/40 hover:text-white transition">Concept</a>
            <a href="#showcase" className="text-sm font-bold text-white/40 hover:text-white transition">Succès</a>
            <a href="#faq" className="text-sm font-bold text-white/40 hover:text-white transition">FAQ</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <button onClick={onStartAdmin} className="text-sm font-bold text-white border border-white/20 hover:border-white/60 transition px-4 py-2.5 rounded-xl">
                    🛡️ Admin
                  </button>
                )}
                <button onClick={onStartClient} className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl text-sm font-black shadow-xl shadow-emerald-500/20 transition hover:scale-105 active:scale-95">
                  MON ESPACE
                </button>
                <button onClick={onLogout} className="text-xs font-bold text-white/30 hover:text-white/70 transition px-2 py-2.5">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button onClick={onStartClient} className="text-sm font-bold text-white border border-white/20 hover:border-white/60 hover:text-white transition px-4 py-2.5 rounded-xl">
                  Connexion
                </button>
                <button onClick={onStartClient} className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl text-sm font-black shadow-xl shadow-emerald-500/20 transition hover:scale-105 active:scale-95">
                  ESPACE CLIENT
                </button>
              </>
            )}
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onStartClient}
              className="bg-emerald-500 text-black px-3 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20"
            >
              {user ? 'MON ESPACE' : 'ESPACE CLIENT'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white/50 hover:text-white p-2 transition"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#0c0c0c]"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-white/50 hover:text-white py-3 transition">Concept</a>
                <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-white/50 hover:text-white py-3 transition">Succès</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-white/50 hover:text-white py-3 transition">FAQ</a>
                {user ? (
                  <>
                    {isAdmin && (
                      <button onClick={() => { onStartAdmin(); setMobileMenuOpen(false); }} className="text-left text-sm font-bold text-white/50 hover:text-white py-3 transition">
                        🛡️ Admin
                      </button>
                    )}
                    <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-left text-sm font-bold text-white/30 hover:text-white/70 py-3 transition">
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <button onClick={() => { onStartClient(); setMobileMenuOpen(false); }} className="text-left text-sm font-bold text-white/50 hover:text-white py-3 transition">
                    Connexion
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 md:px-8 pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-24 md:pb-32 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-10"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400">Nouveau : 12 Vidéos sorties cette semaine</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.8rem] sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-6 sm:mb-10 leading-[0.88] uppercase text-center"
          >
            Ta vie mérite
            <br />
            <span className="text-white/20">d'être racontée.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-2xl text-white/40 max-w-2xl sm:max-w-3xl mx-auto mb-10 sm:mb-16 leading-tight font-medium text-center"
          >
            Dépose ton témoignage. Notre CrewAI le transforme en{' '}
            <span className="text-white">vidéo virale</span> narrée par{' '}
            <span className="text-emerald-400 font-black tracking-tighter">DOLUANELKA</span>.{' '}
            <br className="hidden sm:block" />
            Gagne 40% des revenus générés.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <button
              onClick={onStartClient}
              className="group w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-8 sm:px-12 py-4 sm:py-6 rounded-[2rem] font-black text-base sm:text-xl flex items-center justify-center gap-3 sm:gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/30"
            >
              DÉPOSER MON RÉCIT
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#0c0c0c] bg-white/10 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-white/40">+450 Créateurs actifs</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { value: '1,200+', label: 'Histoires Reçues', color: '' },
            { value: '42k €', label: 'Reversements Auteurs', color: 'text-emerald-400' },
            { value: '15M', label: 'Vues TikTok', color: '' },
            { value: '92%', label: 'Satisfaction IA', color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label}>
              <p className={`text-3xl sm:text-4xl font-black mb-1 tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/30 italic">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 sm:gap-10 mb-14 sm:mb-20 md:mb-24">
          <div className="max-w-2xl">
            <span className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-3 block italic">Notre Processus Pipeline</span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
              DU VÉCU BRUT <br /> AU SUCCÈS VIRAL.
            </h2>
          </div>
          <p className="text-white/40 max-w-sm font-medium leading-relaxed text-sm sm:text-base">
            On ne se contente pas de raconter. On sublime ton expérience grâce à une armée d'agents IA spécialisés.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: MessageSquare, title: 'Dépôt Anonyme', desc: "Pseudo, titre et témoignage brute. Pas besoin d'être écrivain." },
            { icon: BookOpen, title: 'Optimisation IA', desc: 'CrewAI structure ton texte pour le rendre addictif et émouvant.' },
            { icon: Crown, title: 'Narration Dolu', desc: 'Clonage vocal haute fidélité pour une immersion totale aux Antilles.' },
            { icon: TrendingUp, title: 'Boost & Gains', desc: 'On publie, ça perce, tu touches tes 40% sur ton wallet personnel.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 p-7 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] relative group overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl transition group-hover:bg-emerald-500/20" />
              <div className="bg-white/5 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border border-white/10 group-hover:bg-emerald-500 group-hover:text-black transition">
                <step.icon size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-tighter">{step.title}</h3>
              <p className="text-white/30 text-sm leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-center mb-14 sm:mb-20 md:mb-24 uppercase">Viral Showcase</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              { title: 'LE SECRET DU DÉSERT', views: '1.2M vues', author: '@artiste_dolu', img: '/showcase/story1.png' },
              { title: 'RENCONTRE MYSTÉRIEUSE', views: '850k vues', author: '@myst_user', img: '/showcase/story2.png' },
              { title: 'ACCIDENT MARTINIQUE', views: '2.5M vues', author: '@safe_ride', img: '/showcase/story3.png' },
            ].map((video, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="group relative aspect-[9/16] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src={video.img} alt={video.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="bg-red-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <Play size={9} fill="currentColor" /> Live
                    </span>
                    <span className="text-[10px] font-bold text-white/60 tracking-widest">{video.views}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-1.5 sm:mb-2 tracking-tighter uppercase">{video.title}</h3>
                  <p className="text-xs text-white/40 font-bold tracking-widest">{video.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-center mb-14 sm:mb-20 md:mb-24 uppercase italic">Témoignages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[
            { name: 'Mickaël L.', job: 'Directeur Marketing', quote: "J'avais un vécu lourd à partager. En 48h, j'ai vu ma vie devenir une vidéo à 1M de vues. Les revenus ont été versés direct sur mon wallet. Incroyable expérience.", rating: 5 },
            { name: 'Sarah G.', job: 'Étudiante', quote: "L'IA a vraiment respecté l'émotion de mon récit. La voix de Dolu donne une âme à l'histoire. J'ai déjà reçu mon premier virement de 450€.", rating: 5 },
          ].map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem]">
              <div className="flex gap-1 mb-6 sm:mb-8">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-emerald-500" fill="currentColor" />)}
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 sm:mb-10 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="avatar" />
                </div>
                <div>
                  <p className="font-black text-base sm:text-lg">{t.name}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{t.job}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Split */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 bg-emerald-500 text-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-12 sm:gap-16 md:gap-20">
          <div className="flex-1 w-full">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8 sm:mb-10 uppercase">
              Transparence <br /> Totale.
            </h2>
            <p className="text-base sm:text-xl md:text-2xl font-black mb-8 sm:mb-12 opacity-80 leading-tight">
              Chaque euro généré sur TikTok ou Youtube est réparti par notre contrat intelligent.
            </p>
            <div className="space-y-4 sm:space-y-6">
              {[
                { label: "L'Auteur (Toi)", part: '40%', desc: 'Pour la propriété intellectuelle.' },
                { label: 'DOLUANELKA', part: '10%', desc: "Pour l'image et l'incarnation." },
                { label: 'Infrastructure', part: '30%', desc: 'Maintenance et APIs IA.' },
                { label: 'Donner La Parole', part: '20%', desc: 'Frais de gestion et marketing.' },
              ].map(item => (
                <div key={item.label} className="border-b border-black/10 pb-4 flex justify-between items-end gap-4">
                  <div>
                    <p className="text-base sm:text-xl font-black">{item.label}</p>
                    <p className="text-xs sm:text-sm font-bold opacity-60 uppercase tracking-widest">{item.desc}</p>
                  </div>
                  <p className="text-3xl sm:text-4xl font-black tracking-tighter shrink-0">{item.part}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-black rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-16 text-white shadow-2xl">
            <h3 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 italic tracking-tighter uppercase">Calculateur de Gains</h3>
            <div className="space-y-6 sm:space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Vues Estimées</label>
                <input type="range" className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between mt-2 text-lg sm:text-xl font-black">
                  <span>100k</span>
                  <span className="text-emerald-400">1M+</span>
                </div>
              </div>
              <div className="pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-xs font-black uppercase tracking-widest">Tes gains estimés</p>
                <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tighter">~ 420.00 €</p>
              </div>
              <p className="text-[10px] text-white/20 italic font-bold">Basé sur un RPM moyen de 0.70€ par 1000 vues admissibles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-center mb-14 sm:mb-20 md:mb-24 uppercase italic">Questions Fréquentes</h2>
        <div className="space-y-1 sm:space-y-2">
          <FAQItem question="Est-ce que je reste anonyme ?" answer="Oui. Nous utilisons ton pseudo uniquement pour le crédit social sur les réseaux, mais ton identité réelle reste strictement confidentielle entre toi et nos serveurs sécurisés." />
          <FAQItem question="Comment suis-je payé ?" answer="Dès que tes gains cumulés atteignent 50€, tu peux demander un retrait via Stripe ou PayPal depuis ton Espace Client." />
          <FAQItem question="L'IA peut-elle modifier mon histoire ?" answer="Notre IA structure le texte pour le rythme vidéo (Hook, Storytelling, Call to Action) mais conserve 100% de la vérité brute que tu nous as envoyée." />
          <FAQItem question="Quelles histoires sont rejetées ?" answer="Nous rejetons les contenus haineux, illégaux ou sans intérêt narratif. Notre CrewAI analyse chaque texte pour garantir un standard de qualité élevé." />
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-28 md:py-40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 -z-10 blur-[150px] pointer-events-none" />
        <h2 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter mb-10 sm:mb-16 leading-none">
          C'EST TON <br /> MOMENT.
        </h2>
        <button
          onClick={onStartClient}
          className="w-full sm:w-auto bg-white text-black px-10 sm:px-16 py-5 sm:py-8 rounded-[2rem] sm:rounded-[2.5rem] font-black text-lg sm:text-2xl uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-2xl hover:bg-emerald-400"
        >
          DÉMARRER L'AVENTURE
        </button>
        <p className="mt-8 sm:mt-12 text-white/20 font-bold uppercase tracking-widest text-[10px]">Rejoins 450+ créateurs qui ont déjà sauté le pas.</p>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 md:px-8 py-14 sm:py-20 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 sm:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-black" />
              </div>
              <span className="font-black text-base sm:text-lg uppercase tracking-tighter">Donner La Parole</span>
            </div>
            <p className="text-xs sm:text-sm text-white/30 leading-relaxed font-medium">
              La première plateforme multi-agents qui transforme ton vécu en actifs numériques viraux. Propulsé par CrewAI & DOLUANELKA.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {[
              { title: 'Plateforme', links: ['Comment ça marche', 'Gains & Wallet', 'Catégories'] },
              { title: 'Ressources', links: ["Aide à l'écriture", 'Blog', 'TikTok'] },
              { title: 'Légal', links: ['Confidentialité', "Droit à l'image", 'CGU'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-black text-[10px] uppercase tracking-widest text-white/20 mb-4 sm:mb-6">{col.title}</p>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm font-bold">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-white/40 hover:text-white transition">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-widest text-center sm:text-left">© 2026 DONNER LA PAROLE. TOUS DROITS RÉSERVÉS.</p>
          <div className="flex gap-4 sm:gap-6">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/5 rounded-full" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/5 rounded-full" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/5 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
