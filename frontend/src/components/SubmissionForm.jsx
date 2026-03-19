import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, ChevronLeft, CreditCard, Sparkles, Wand2, CheckSquare } from 'lucide-react';

const CATEGORIES = [
  { id: 'trahison', label: 'Trahison', emoji: '🔪', desc: 'Infidélité, mensonge, coup de poignard dans le dos' },
  { id: 'famille', label: 'Famille', emoji: '🏚️', desc: 'Relations toxiques, secrets, conflits familiaux' },
  { id: 'amour', label: 'Amour', emoji: '💔', desc: 'Rupture, manipulation sentimentale, obsession' },
  { id: 'argent', label: 'Argent', emoji: '💸', desc: 'Arnaque, dette, jalousie financière' },
  { id: 'revenge', label: 'Revenge', emoji: '⚡', desc: 'Vengeance, justice personnelle, retournement de situation' },
  { id: 'immigration', label: 'Exil & Identité', emoji: '✈️', desc: 'Immigration, racisme, reconstruction de soi' },
  { id: 'travail', label: 'Travail', emoji: '🏢', desc: 'Injustice au boulot, licenciement, harcèlement' },
  { id: 'paranormal', label: 'Paranormal', emoji: '👁️', desc: 'Spiritualité, expériences inexpliquées, présages' },
  { id: 'coquin', label: 'Chaud & Coquin', emoji: '🌶️', desc: 'Histoires suggestives, rencontres inattendues, révélations intimes', adult: true },
];

const SubmissionForm = ({ onBack, initialPseudo = 'Dolu' }) => {
  const [formData, setFormData] = useState({
    pseudo: initialPseudo,
    title: '',
    category: '',
    story: '',
    signature: '',
    agreed: false
  });
  const [isImproving, setIsImproving] = useState(false);

  const handleAIImprove = async () => {
    if (!formData.story) return alert("Écris d'abord un début d'histoire !");
    setIsImproving(true);
    
    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.story })
      });
      
      if (!response.ok) throw new Error("Erreur lors de l'amélioration");
      
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        story: data.improvedText
      }));
    } catch (err) {
      console.error(err);
      alert("L'IA n'a pas pu améliorer ton texte pour le moment.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Choisis une catégorie pour ton histoire.");
    if (!formData.agreed) return alert("Veuillez accepter les conditions.");
    if (!formData.signature) return alert("Veuillez signer électroniquement.");
    
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: formData.pseudo,
          title: formData.title,
          category: formData.category,
          content: formData.story,
          signature: formData.signature
        })
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi');

      alert("[V2] Merci ! Ton récit va maintenant être analysé par CrewAI.");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-6 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft size={16} />
        Annuler
      </button>

      <header className="max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
          Ta vie mérite <br /> d'être racontée.
        </h1>
        <p className="text-emerald-400 text-lg md:text-xl font-bold italic">
          Devient le prochain script de Dolu.
        </p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-10 pb-20">
          {/* Pseudo */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Pseudo TikTok / Réseaux</label>
            <input 
              type="text"
              required
              value={formData.pseudo}
              onChange={(e) => setFormData({...formData, pseudo: e.target.value})}
              placeholder="@tonpseudo"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
            />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Titre de l'histoire</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Le jour où tout a basculé..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 outline-none transition font-bold text-lg"
            />
          </div>

          {/* Category */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
              Catégorie <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat.id})}
                  className={`relative text-left p-4 rounded-2xl border transition-all ${
                    formData.category === cat.id
                      ? cat.adult ? 'bg-red-500/15 border-red-500 text-white' : 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                  }`}
                >
                  {cat.adult && (
                    <span className="absolute top-2 right-2 text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">🔞</span>
                  )}
                  <span className="text-2xl">{cat.emoji}</span>
                  <p className="font-black text-sm mt-2 leading-tight">{cat.label}</p>
                  <p className="text-[10px] mt-1 leading-tight opacity-60">{cat.desc}</p>
                </button>
              ))}
            </div>
            {formData.category === 'coquin' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-300 font-medium">
                🔞 <span className="font-black">Contenu adulte</span> — Ton histoire sera marquée "18+" et soumise à une modération renforcée avant publication. Aucun contenu explicitement pornographique ne sera accepté.
              </div>
            )}
          </div>

          {/* Story Body */}
          <div className="space-y-3 relative">
            <div className="flex justify-between items-end mb-1">
               <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Ton vécu brut</label>
               <button 
                type="button"
                onClick={handleAIImprove}
                disabled={isImproving}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-purple-600/20 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20 hover:bg-purple-600 hover:text-white transition disabled:opacity-50"
               >
                 {isImproving ? <Sparkles className="animate-pulse" size={12} /> : <Wand2 size={12} />}
                 Aide à l'écriture (IA)
               </button>
            </div>
            <textarea 
              required
              value={formData.story}
              onChange={(e) => setFormData({...formData, story: e.target.value})}
              placeholder="Raconte-nous tout en détails. Plus il y a de vécu, plus la vidéo sera virale..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[250px] focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Optional Upload */}
          <div className="bg-white/5 border border-white/10 border-dashed rounded-[2rem] p-10 text-center cursor-pointer hover:bg-white/10 transition group">
            <Camera className="mx-auto mb-4 text-white/10 group-hover:text-emerald-400 transition group-hover:scale-110" size={40} />
            <p className="text-sm font-bold">Ajoute des preuves ou photos (optionnel)</p>
            <p className="text-xs text-white/20 mt-2 italic font-medium">Pour nourrir l'IA en détails réels et visuels</p>
          </div>

          {/* Reward Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
               <CreditCard size={120} />
            </div>
            <div className="bg-emerald-500 p-3 rounded-2xl text-black shadow-lg shadow-emerald-500/20">
              <CreditCard size={28} />
            </div>
            <div>
              <p className="font-black text-xl text-emerald-400 leading-none">40% des revenus</p>
              <p className="text-xs text-emerald-400/60 font-bold mt-1 uppercase tracking-widest">Partagés avec toi via Stripe</p>
            </div>
          </div>

          {/* Legal & Signature */}
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex gap-4 items-start">
              <input 
                type="checkbox"
                required
                id="legal"
                checked={formData.agreed}
                onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                className="mt-1 w-6 h-6 accent-emerald-500 flex-shrink-0"
              />
              <label htmlFor="legal" className="text-xs text-white/30 leading-relaxed font-medium">
                Je cède les droits d'exploitation de mon récit pour une exploitation commerciale en échange de 40% des revenus publicitaires générés sur le compte Media. J'autorise <span className="text-white">Donner La Parole</span> à utiliser mon pseudo et mes fichiers pour la diffusion et la monétisation.
              </label>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Signature Électronique (Tape ton nom completion)</label>
               <input 
                 type="text"
                 required
                 value={formData.signature}
                 onChange={(e) => setFormData({...formData, signature: e.target.value})}
                 placeholder="Ton Nom et Prénom"
                 className="w-full bg-transparent border-b border-white/10 py-3 focus:border-emerald-500 outline-none transition font-serif italic text-xl text-emerald-400"
               />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-6 rounded-full font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-500/20"
          >
            <Send size={24} />
            ENVOYER MON RÉCIT
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SubmissionForm;
