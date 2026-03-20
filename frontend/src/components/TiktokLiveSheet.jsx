import React, { useState } from 'react';
import { Copy, Check, Gift, Trophy, BarChart2, Zap, Clock, DollarSign, Flame, Heart, Users, Star, AlertCircle, ChevronDown, ChevronUp, Volume2, Target } from 'lucide-react';

function CopyBox({ label, value, color = 'emerald' }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const colors = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    purple:  'border-purple-500/20 bg-purple-500/5 text-purple-400',
    pink:    'border-pink-500/20 bg-pink-500/5 text-pink-400',
    blue:    'border-blue-500/20 bg-blue-500/5 text-blue-400',
    orange:  'border-orange-500/20 bg-orange-500/5 text-orange-400',
  };
  return (
    <div className={`border rounded-2xl p-4 space-y-2 ${colors[color]}`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
        <button onClick={copy} className="opacity-40 hover:opacity-100 transition">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="text-sm font-medium leading-relaxed text-white/80">{value}</p>
    </div>
  );
}

function Section({ icon: Icon, title, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
    pink:    'text-pink-400 bg-pink-500/10 border-pink-500/20',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange:  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };
  return (
    <div className="bg-white/5 border border-white/8 rounded-[1.5rem] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colors[color]}`}>
            <Icon size={17} />
          </div>
          <span className="font-black text-sm uppercase tracking-tight">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

function Tip({ text, highlight }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-white/60">
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
      <span>{highlight ? <strong className="text-white/90">{highlight}</strong> : null}{text}</span>
    </li>
  );
}

const TiktokLiveSheet = ({ story }) => {
  const title = story?.title || 'ton histoire';
  const pseudo = story?.pseudo || 'l\'auteur';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-[1.5rem]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
          <Flame size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-base uppercase tracking-tight">Fiche Live TikTok</h2>
          <p className="text-xs text-white/40 mt-0.5">Stratégie de monétisation complète pour le live autour de <span className="text-pink-400 font-bold">"{title}"</span></p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Objectif</p>
          <p className="text-lg font-black text-emerald-400">MAX €€€</p>
        </div>
      </div>

      {/* Timing optimal */}
      <Section icon={Clock} title="Timing & Durée Optimaux" color="blue" defaultOpen>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Heure idéale', value: '19h – 21h30', sub: 'Antilles + Métropole actives' },
            { label: 'Durée cible', value: '45 – 90 min', sub: 'Pic à 40 min, couper sur le haut' },
            { label: 'Fréquence', value: '2× / semaine', sub: 'Régularité = algo favorisé' },
          ].map(s => (
            <div key={s.label} className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{s.label}</p>
              <p className="text-xl font-black text-blue-400">{s.value}</p>
              <p className="text-[10px] text-white/30 mt-1 italic">{s.sub}</p>
            </div>
          ))}
        </div>
        <ul className="space-y-2 pt-2">
          <Tip highlight="Ne commence JAMAIS à l'heure pile." text=" Lance-toi 5 min avant pour capter les premiers viewers avant l'algo." />
          <Tip highlight="Arrête le live sur un pic de viewers" text=" — jamais en déclin. L'algo mémorise le pic, pas la fin." />
        </ul>
      </Section>

      {/* Script de démarrage */}
      <Section icon={Volume2} title="Script d'Introduction Live" color="purple">
        <CopyBox
          color="purple"
          label="Intro à lire mot pour mot (0–2 min)"
          value={`🔴 On est en LIVE ! Bonsoir tout le monde ! Bienvenue à tous ceux qui arrivent ! Likez le live pour me faire signe que vous êtes là 🙏\n\nCe soir on va parler d'une histoire VRAIE et incroyable — celle de @${pseudo}. Moi j'ai été choqué en la lisant. On va la visionner ensemble et après je veux votre avis.\n\nMais d'abord… pour ceux qui me rejoignent maintenant : partagez ce live à 3 personnes dans les 2 prochaines minutes, ça m'aide énormément ❤️`}
        />
        <CopyBox
          color="purple"
          label="Relance toutes les 10 min"
          value={`Pour ceux qui viennent d'arriver, bienvenue ! On regarde l'histoire de @${pseudo} — une histoire vraie qui va vous retourner. Likez et partagez si vous êtes là ! Et si vous voulez soutenir le live, les cadeaux sont ouverts 🎁`}
        />
      </Section>

      {/* Monétisation — Cadeaux */}
      <Section icon={Gift} title="Monétisation — Cadeaux & Diamonds" color="pink">
        <div className="grid grid-cols-2 gap-3">
          {[
            { gift: '🌹 Rose (1)', trigger: 'Premier viewer à arriver', reward: 'Mention + cœur en live' },
            { gift: '🎮 Game (5)', trigger: 'Partage prouvé', reward: 'Merci vocal + sticker' },
            { gift: '🦁 Lion (29)', trigger: 'Top commentaire', reward: 'Épingler son commentaire 3 min' },
            { gift: '🚀 Rocket (199)', trigger: '—', reward: 'Shoutout + dédicace vidéo suivante' },
            { gift: '🦄 Unicorn (299)', trigger: '—', reward: 'Apparaître dans le générique vidéo' },
            { gift: '🌌 Galaxy (1000)', trigger: '—', reward: 'Co-créateur de la prochaine vidéo' },
          ].map(g => (
            <div key={g.gift} className="bg-pink-500/5 border border-pink-500/15 rounded-2xl p-3 space-y-1.5">
              <p className="text-sm font-black">{g.gift}</p>
              {g.trigger !== '—' && <p className="text-[10px] text-white/30 italic">Déclencheur : {g.trigger}</p>}
              <p className="text-[10px] text-pink-400 font-bold">→ {g.reward}</p>
            </div>
          ))}
        </div>
        <CopyBox
          color="pink"
          label="Phrase d'appel aux cadeaux à lancer toutes les 15 min"
          value={`Si vous aimez ce contenu et que vous voulez nous soutenir pour continuer à raconter des histoires comme celle de @${pseudo}, les cadeaux sont ouverts 🎁 Le moindre cadeau nous permet de faire tourner la machine. Même une rose ça compte ! 🌹`}
        />
        <div className="bg-pink-500/5 border border-pink-500/15 rounded-2xl p-4">
          <p className="text-xs font-black uppercase tracking-widest text-pink-400 mb-2">Objectif Diamond Session</p>
          <div className="flex items-center gap-4">
            {[['5k', '~17€', 'Session normale'], ['15k', '~52€', 'Bonne session'], ['50k', '~175€', 'Live viral']].map(([d, e, l]) => (
              <div key={d} className="text-center flex-1">
                <p className="text-lg font-black text-pink-400">{d} 💎</p>
                <p className="text-xs font-bold text-white/60">{e}</p>
                <p className="text-[10px] text-white/30 italic">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Jeux concours */}
      <Section icon={Trophy} title="Jeux Concours Live" color="orange">
        <CopyBox
          color="orange"
          label="Concours simple — Qui partage le plus ?"
          value={`🏆 CONCOURS ! Les 3 premiers à me prouver qu'ils ont partagé ce live dans leur story reçoivent une DÉDICACE dans la prochaine vidéo ! Envoyez-moi une capture en DM maintenant ! Vous avez 5 minutes ⏱️`}
        />
        <CopyBox
          color="orange"
          label="Concours prédiction (engagement max)"
          value={`❓ QUESTION DU LIVE : À votre avis, comment s'est terminée cette histoire ? Tapez A ou B dans les commentaires !\n\nA — Ça s'est arrangé\nB — Ça a tout détruit\n\nLe premier qui trouve juste gagne un SHOUTOUT ! GO GO GO 👇`}
        />
        <CopyBox
          color="orange"
          label="Concours cadeau (boost monétisation)"
          value={`🎁 SPECIAL LIVE : Celui ou celle qui envoie le plus gros cadeau dans les 10 prochaines minutes sera mentionné dans la description de la vidéo publiée ! Son pseudo associé à l'histoire de @${pseudo} pour toujours. Qui joue ? ⬇️`}
        />
        <ul className="space-y-2 pt-1">
          <Tip highlight="Lance au moins 2 jeux par live" text=" — un en début (chauffer) et un en milieu (pic)." />
          <Tip highlight="Annonce le gagnant à voix haute" text=", épingle son commentaire, les autres viewers voudront aussi gagner." />
        </ul>
      </Section>

      {/* Sondages */}
      <Section icon={BarChart2} title="Sondages & Questions Live" color="emerald">
        <CopyBox
          color="emerald"
          label="Sondage d'entrée (premières 5 min)"
          value={`📊 SONDAGE : Vous connaissiez déjà une histoire similaire ?\n\n👍 OUI — likez la vidéo\n👎 NON — envoyez un 🔥 dans les comms\n\nJe regarde en temps réel !`}
        />
        <CopyBox
          color="emerald"
          label="Sondage milieu de live (engagement)"
          value={`📊 VOTE : Dolu devrait raconter quelle histoire en SUIVANT ?\n\nA — Une histoire d'amour impossible\nB — Une arnaque incroyable\nC — Une rencontre paranormale\n\nTapez A, B ou C ! La lettre la plus commentée gagne 🏆`}
        />
        <CopyBox
          color="emerald"
          label="Sondage de fidélisation (fin de live)"
          value={`📊 DERNIER VOTE : Ce live vous a plu ?\n\n❤️ = Oui, reviens vite !\n💜 = Oui mais fais-le plus long\n🔥 = C'était INCROYABLE\n\nCe sondage décide de la date du prochain live ! Votez maintenant !`}
        />
      </Section>

      {/* Engagement & algorithme */}
      <Section icon={Target} title="Tricks Algo & Engagement" color="blue">
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: '⏱️', title: 'Les 2 premières minutes', desc: "Clé de tout. L'algo évalue ton live au début. Parle FORT, sois dynamique, crée de l'urgence immédiatement." },
            { icon: '💬', title: 'Forcer les commentaires', desc: "Pose des questions ouvertes toutes les 3–4 min. Plus de commentaires = l'algo pousse ton live à plus de monde." },
            { icon: '👤', title: 'Mentionner les viewers', desc: "Dis leurs pseudos à voix haute quand ils rejoignent ou commentent. Ils restent 3× plus longtemps quand ils sont cités." },
            { icon: '📌', title: 'Épingler les bons commentaires', desc: "Épingle les commentaires enthousiastes ou les questions intéressantes. Ça guide les nouveaux arrivants." },
            { icon: '🔄', title: 'Récaps réguliers', desc: "Toutes les 10–15 min, résume ce qui s'est passé pour les nouveaux. Réduit le bounce des arrivants tardifs." },
          ].map(t => (
            <div key={t.title} className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
              <span className="text-xl shrink-0">{t.icon}</span>
              <div>
                <p className="text-sm font-black mb-1">{t.title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Scénario minute par minute */}
      <Section icon={Zap} title="Scénario Minute par Minute" color="orange">
        <div className="space-y-2">
          {[
            { time: '0–5 min',   color: 'text-orange-400', action: 'Accueil chaleureux, présentation du live, premier sondage, appel au partage' },
            { time: '5–15 min',  color: 'text-yellow-400', action: `Intro de l'histoire de @${pseudo}. Suspense. Questions aux viewers. 1er appel aux cadeaux.` },
            { time: '15–30 min', color: 'text-emerald-400', action: 'Visionnage de la vidéo ou lecture du récit. Réactions en direct. Questions ouvertes. Jeu concours #1.' },
            { time: '30–45 min', color: 'text-blue-400',   action: 'Discussion approfondie. Témoignages similaires des viewers. Sondage vote histoire suivante. Top cadeaux cités.' },
            { time: '45–60 min', color: 'text-purple-400', action: 'Montée en puissance. Jeu concours #2 (cadeau). Appel max aux cadeaux. Annonce du prochain live.' },
            { time: '60 min+',   color: 'text-pink-400',   action: 'Extension si viewers > 500. Sinon : clôture sur pic, sondage final, remerciements personnalisés, CTA prochain live.' },
          ].map(s => (
            <div key={s.time} className="flex items-start gap-3 p-3 border border-white/5 rounded-xl bg-white/[0.02]">
              <span className={`text-xs font-black shrink-0 w-16 ${s.color}`}>{s.time}</span>
              <p className="text-xs text-white/60 leading-relaxed">{s.action}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* KPIs */}
      <Section icon={DollarSign} title="Objectifs & KPIs à Surveiller" color="emerald">
        <div className="grid grid-cols-2 gap-3">
          {[
            { kpi: 'Viewers simultanés', good: '> 200', great: '> 1000' },
            { kpi: 'Taux de like/viewer', good: '> 30%', great: '> 60%' },
            { kpi: 'Diamonds session', good: '> 5 000', great: '> 50 000' },
            { kpi: 'Commentaires/min', good: '> 20', great: '> 100' },
            { kpi: 'Partages live', good: '> 50', great: '> 500' },
            { kpi: 'Durée moy. viewer', good: '> 5 min', great: '> 15 min' },
          ].map(k => (
            <div key={k.kpi} className="bg-white/5 border border-white/8 rounded-2xl p-3 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{k.kpi}</p>
              <div className="flex justify-between">
                <div className="text-center">
                  <p className="text-xs font-black text-yellow-400">{k.good}</p>
                  <p className="text-[9px] text-white/20">Bien</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-emerald-400">{k.great}</p>
                  <p className="text-[9px] text-white/20">Top</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Alerte erreurs fréquentes */}
      <div className="flex items-start gap-3 p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
        <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-white/50">
          <p className="font-black text-red-400 text-sm">Erreurs à éviter absolument</p>
          <p>❌ Ne jamais rester silencieux plus de 20 secondes — parle en continu même si personne ne commente</p>
          <p>❌ Ne pas supplier les cadeaux — propose des <strong>contreparties valables</strong></p>
          <p>❌ Ne pas finir le live sur un creux de viewers — attends une remontée ou crée-la artificiellement</p>
          <p>❌ Éviter les controverses ou politiques — rester 100% feel-good / émotionnel</p>
        </div>
      </div>

    </div>
  );
};

export default TiktokLiveSheet;
