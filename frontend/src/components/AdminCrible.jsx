import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, FileEdit, Trash2, CheckCircle, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';

const AdminCrible = ({ onLaunchProd }) => {
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState([]);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stories?status=wait');
      const data = await res.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setStories(data);
      } else {
        console.error("API returned non-array data:", data);
        setStories([]); // Fallback to empty array
      }
    } catch (err) {
      console.error("Fetch stories failed:", err);
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUpdateScript = async (id, newContent) => {
    try {
      const response = await fetch(`/api/stories/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (response.ok) {
        setStories(prev => prev.map(s => s.id === id ? { ...s, content: newContent } : s));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold uppercase tracking-widest text-xs">Chargement du Crible...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[2.5rem]">
           <Sparkles className="mx-auto mb-4 text-white/10" size={48} />
           <p className="text-white/40 font-bold">Aucune histoire en attente de validation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div 
              key={story.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 group relative overflow-hidden"
            >
              {/* Virality Score Badge */}
              <div className="absolute top-6 right-6 flex flex-col items-end">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${(story.score || 50) > 80 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  {story.score || 50}% Virinité
                </div>
              </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg truncate pr-20">{story.title}</h3>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${story.score}%` }}
                  className={`h-full ${story.score > 80 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-purple-500'}`}
                />
              </div>
            </div>

            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white/50 leading-relaxed italic line-clamp-4">
              "{story.content}"
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setEditingId(story.id)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition"
              >
                <FileEdit size={14} />
                Éditer Script
              </button>
              <button 
                onClick={() => onLaunchProd(story.id)}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20"
              >
                <Play size={14} fill="currentColor" />
                Lancer Prod
              </button>
            </div>

            {/* Editing Modal (Simulated) */}
            {editingId === story.id && (
              <div className="absolute inset-0 bg-[#0a0a0a] p-8 z-10 flex flex-col gap-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">Édition du Script</h4>
                <textarea 
                  defaultValue={story.content}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-1 focus:ring-purple-500"
                  id={`edit-${story.id}`}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-white/5 py-3 rounded-xl text-[10px] font-bold uppercase"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => handleUpdateScript(story.id, document.getElementById(`edit-${story.id}`).value)}
                    className="flex-1 bg-emerald-500 text-black py-3 rounded-xl text-[10px] font-bold uppercase"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};

export default AdminCrible;
