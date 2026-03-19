import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress, status }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-white/40 text-sm mb-1 capitalize">{status.replace('_', ' ')}</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-lg font-bold">{Math.round(progress)}%</p>
          </div>
        </div>
        <p className="text-white/40 text-sm">Génération du clip {Math.ceil((progress / 100) * 30)}/30...</p>
      </div>
      <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
