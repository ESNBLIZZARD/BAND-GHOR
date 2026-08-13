import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../../store/playerStore';
import { PlayerControls } from './PlayerControls';
import { Disc3, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';

export function NowPlaying() {
  const { currentTrack, isPlaying, dominantColor, customThemeColor } = usePlayerStore();
  const [showToast, setShowToast] = useState(false);

  const activeColor = customThemeColor || dominantColor;

  const handleShare = () => {
    if (!currentTrack) return;
    
    const url = `${window.location.origin}/?songId=${currentTrack.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  if (!currentTrack) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-neutral-500">
          <Disc3 size={48} className="animate-pulse" />
          <p className="font-bengali text-lg tracking-widest">গান নির্বাচন করুন</p>
        </div>
      </div>
    );
  }

  // To map track band to slug (since we don't store bandSlug on track directly in the initial model, we can slugify the name for now, or just use the bandId if it was slug, but our DB seed uses slugs as IDs: e.g., 'fossils')
  // We can derive a fallback slug:
  const bandSlug = (currentTrack as any).bandSlug || currentTrack.bandName.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex-1 flex w-full max-w-[90rem] mx-auto px-4 sm:px-8 md:px-16 py-2 sm:py-12 justify-center md:justify-end items-center">
      <div className="w-full max-w-[360px] flex flex-col items-center bg-neutral-950/40 backdrop-blur-3xl p-4 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.7)] relative overflow-hidden group/player transition-all duration-500 hover:shadow-[0_20px_80px_rgba(255,255,255,0.05)] hover:border-white/10 hover:bg-neutral-950/60" style={{ '--active-color': activeColor } as any}>
        {/* Subtle glow inside card */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen transition-opacity duration-700 group-hover/player:opacity-40"
          style={{ background: activeColor ? `radial-gradient(circle at 50% 0%, rgba(${activeColor}, 0.8) 0%, transparent 70%)` : 'transparent' }}
        />

        {/* Artwork */}
        <div className="w-full aspect-square max-w-[160px] sm:max-w-[220px] mb-4 sm:mb-8 relative group z-10">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)', rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)', rotateY: -10 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full relative z-10 transition-transform duration-500 hover:scale-105 hover:rotate-2 [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 bg-neutral-900 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden rounded-xl border border-white/10 group-hover:border-white/30 transition-colors">
              <img src={currentTrack.artworkUrl} alt={currentTrack.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-xl" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Track Info */}
      <div className="w-full text-center mb-4 sm:mb-10 flex flex-col items-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id + "-info"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center relative w-full px-2"
          >
            <div className="flex items-center justify-center gap-2 mb-2 w-full relative">
              <h2 className="text-lg sm:text-2xl font-normal text-white font-bengali tracking-tight leading-tight text-center px-4 md:px-8 truncate w-full">
                {currentTrack.bengaliTitle || currentTrack.title}
              </h2>
              <button 
                onClick={handleShare}
                className="text-neutral-500 hover:text-white transition-colors p-2 absolute right-0"
                title="Share track"
              >
                <Share2 size={20} />
              </button>
            </div>
            
            <Link to={`/bands/${bandSlug}`} className="text-[10px] sm:text-xs text-neutral-400 hover:text-white font-sans uppercase tracking-[0.3em] transition-colors truncate max-w-[80%]">
              {currentTrack.bengaliBandName || currentTrack.bandName}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full relative z-10">
        <div className="w-full h-12 sm:h-20 mb-4 sm:mb-8 px-2 sm:px-4 opacity-90 transition-opacity duration-700" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <AudioVisualizer isPlaying={isPlaying} activeColor={activeColor} barCount={50} />
        </div>
        <PlayerControls />
      </div>
      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-32 md:bottom-24 bg-white text-black px-6 py-3 flex items-center gap-3 shadow-2xl z-50 rounded-sm"
          >
            <Check size={16} />
            <span className="text-xs uppercase tracking-widest font-semibold">Link Copied to Clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
