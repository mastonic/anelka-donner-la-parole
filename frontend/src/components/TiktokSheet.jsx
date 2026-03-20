import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check, Video, FileText, Hash, Sparkles } from 'lucide-react';

function SheetContent({ story, metadata, copyToClipboard, copiedField }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Video Preview */}
      <div className="space-y-5">
        <div className="aspect-[9/16] bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-2xl shadow-emerald-500/10">
          {story.videoUrl ? (
            <video src={story.videoUrl} controls className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20">
              <Video size={56} className="animate-pulse" />
              <p className="font-bold uppercase tracking-widest text-xs">Aperçu vidéo indisponible</p>
            </div>
          )}
        </div>
        <button
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition shadow-xl shadow-emerald-500/20"
          onClick={() => story.videoUrl && window.open(story.videoUrl)}
        >
          <Download size={20} />
          TÉLÉCHARGER LA VIDÉO
        </button>
      </div>

      {/* Right: Metadata */}
      <div className="space-y-5">
        {/* Hook */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" />
              Le Hook (Accroche)
            </h2>
            <button onClick={() => copyToClipboard(metadata.hook, 'hook')} className="text-white/20 hover:text-emerald-400 transition">
              {copiedField === 'hook' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-base font-bold italic leading-relaxed">"{metadata.hook}"</p>
        </div>

        {/* Caption */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <FileText size={14} className="text-blue-400" />
              Description TikTok
            </h2>
            <button onClick={() => copyToClipboard(metadata.caption, 'caption')} className="text-white/20 hover:text-blue-400 transition">
              {copiedField === 'caption' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-medium">{metadata.caption}</p>
        </div>

        {/* Hashtags */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Hash size={14} className="text-purple-400" />
              Hashtags Stratégiques
            </h2>
            <button onClick={() => copyToClipboard(metadata.hashtags, 'hashtags')} className="text-white/20 hover:text-purple-400 transition">
              {copiedField === 'hashtags' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-sm text-purple-400 font-bold tracking-tight">{metadata.hashtags}</p>
        </div>

        {/* Tips */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-3 italic text-[11px] text-white/40">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-xs font-bold">!</div>
          <p>Poste cette vidéo de préférence entre 18h et 21h pour maximiser la portée organique sur l'audience antillaise.</p>
        </div>
      </div>
    </div>
  );
}

const TiktokSheet = ({ story, onBack, inline = false }) => {
  const [copiedField, setCopiedField] = React.useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!story) return null;

  const metadata = {
    hook: "Imagine que toute ta vie s'effondre en un instant...",
    caption: "L'histoire incroyable de " + story.pseudo + ". À voir jusqu'au bout ! #vécu #antilles #dolu",
    hashtags: "#dolu #antilles #histoirevraie #viral #martinique #guadeloupe",
    ...story.metadata
  };

  // Inline mode — embedded directly in the panel, no overlay
  if (inline) {
    return <SheetContent story={story} metadata={metadata} copyToClipboard={copyToClipboard} copiedField={copiedField} />;
  }

  // Modal mode — full screen overlay
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-4 md:p-12 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Video className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Fiche de Production TikTok</h1>
              <p className="text-xs text-white/40 font-bold tracking-widest uppercase">Story ID: {story.id.substring(0, 8)}</p>
            </div>
          </div>
          <button onClick={onBack} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition">
            <X size={24} />
          </button>
        </header>
        <SheetContent story={story} metadata={metadata} copyToClipboard={copyToClipboard} copiedField={copiedField} />
      </div>
    </motion.div>
  );
};

export default TiktokSheet;
