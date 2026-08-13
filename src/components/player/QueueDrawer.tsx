import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../../store/playerStore';
import { X, Play, Share2, Check } from 'lucide-react';
import { classNames, formatTime } from '../../lib/utils';
import React, { useState } from 'react';

export function QueueDrawer() {
  const { queue, queueIndex, currentTrack, isQueueOpen, toggleQueue, play } = usePlayerStore();
  const [showToast, setShowToast] = useState(false);

  const handleShareQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (queue.length === 0) return;
    
    // We only share the remaining queue + current track to keep URL short, or the whole queue?
    // Let's share the whole queue so the state is preserved identically.
    const queueIds = queue.map(t => t.id).join(',');
    const url = `${window.location.origin}/?queue=${queueIds}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleQueue}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-black border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-8 flex items-center justify-between">
              <h3 className="font-sans text-[10px] font-medium tracking-[0.2em] text-neutral-500 uppercase">Archive Queue</h3>
              
              <div className="flex items-center gap-4">
                 <button onClick={handleShareQueue} className="text-neutral-500 hover:text-white transition-colors p-1" title="Share Playlist Queue">
                    <Share2 size={16} strokeWidth={1.5} />
                 </button>
                 <button 
                   onClick={toggleQueue}
                   className="text-neutral-500 hover:text-white transition-colors"
                 >
                   <X size={20} strokeWidth={1.5} />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
              <div>
                <h4 className="text-[9px] font-medium text-neutral-600 uppercase tracking-widest mb-4">Now Playing</h4>
                
                {currentTrack && (
                  <div className="flex items-center gap-4 mb-6 group">
                    <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
                      <img src={currentTrack.artworkUrl} alt={currentTrack.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100">
                        <div className="w-3 h-3 flex justify-between items-end gap-[2px]">
                          <motion.div className="w-[1.5px] bg-white rounded-none" animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          <motion.div className="w-[1.5px] bg-white rounded-none" animate={{ height: ['80%', '30%', '80%'] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }} />
                          <motion.div className="w-[1.5px] bg-white rounded-none" animate={{ height: ['50%', '90%', '50%'] }} transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bengali text-sm font-normal text-white truncate">{currentTrack.bengaliTitle || currentTrack.title}</p>
                      <p className="font-sans text-[9px] uppercase tracking-widest text-neutral-500 truncate mt-0.5">{currentTrack.bengaliBandName || currentTrack.bandName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-[9px] font-medium text-neutral-600 uppercase tracking-widest mb-4">Next</h4>
                
                <div className="flex flex-col gap-4">
                  {queue.slice(queueIndex + 1).map((track, i) => (
                    <button
                      key={track.id + i}
                      onClick={() => play(track)}
                      className="w-full flex items-center gap-4 text-left group"
                    >
                      <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        <img src={track.artworkUrl} alt={track.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={14} className="text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bengali text-sm font-normal text-neutral-400 truncate group-hover:text-white transition-colors">{track.bengaliTitle || track.title}</p>
                        <p className="font-sans text-[9px] uppercase tracking-widest text-neutral-600 truncate mt-0.5">{track.bengaliBandName || track.bandName}</p>
                      </div>
                    </button>
                  ))}
                  
                  {queue.length <= queueIndex + 1 && (
                    <div className="py-8 text-neutral-700 text-[10px] tracking-widest uppercase font-sans">
                      End of queue.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 flex items-center gap-3 shadow-2xl z-50 rounded-sm w-max"
                >
                  <Check size={16} />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Queue link copied</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
