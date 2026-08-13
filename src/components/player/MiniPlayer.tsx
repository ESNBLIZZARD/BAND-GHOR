import { Play, Pause, SkipForward, ListMusic, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AudioVisualizer } from './AudioVisualizer';

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, toggleQueue, toggleLyrics, progress, duration, dominantColor, customThemeColor } = usePlayerStore();
  const navigate = useNavigate();
  
  if (!currentTrack) return null;

  const activeColor = customThemeColor || dominantColor;
  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: 50, opacity: 0, x: '-50%' }}
        className="fixed bottom-4 md:bottom-8 left-1/2 z-40 backdrop-blur-xl border rounded-full p-1 md:p-1.5 flex items-center w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-[380px] overflow-hidden group transition-all duration-700"
        style={{
          backgroundColor: activeColor ? `rgba(${activeColor}, 0.2)` : 'rgba(10, 10, 10, 0.9)',
          borderColor: activeColor ? `rgba(${activeColor}, 0.4)` : 'rgba(255, 255, 255, 0.1)',
          boxShadow: activeColor ? `0 20px 40px -10px rgba(${activeColor}, 0.5), inset 0 0 20px rgba(${activeColor}, 0.1)` : '0 20px 40px rgba(0,0,0,0.8)'
        }}
      >
        {/* Audio Visualizer Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen">
          <AudioVisualizer isPlaying={isPlaying} activeColor={activeColor} barCount={40} />
        </div>

        {/* Subtle Progress Fill Background */}
        <div 
          className="absolute inset-0 pointer-events-none origin-left transition-transform duration-200 z-0" 
          style={{ 
            transform: `scaleX(${progressPercent / 100})`,
            backgroundColor: activeColor ? `rgba(${activeColor}, 0.15)` : 'rgba(255,255,255,0.05)'
          }} 
        />
        
        {/* Track Artwork */}
        <div 
          className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 relative bg-neutral-900 z-10 border border-white/5 cursor-pointer shadow-inner"
          onClick={() => navigate('/')}
        >
          <img src={currentTrack.artworkUrl} alt={currentTrack.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }} className="w-full h-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          )}
        </div>
        
        {/* Track Info */}
        <div 
          className="flex-1 min-w-0 px-4 z-10 flex flex-col justify-center cursor-pointer py-1"
          onClick={() => navigate('/')}
        >
          <h4 className="font-bengali text-[12px] md:text-[13px] font-normal text-white truncate leading-tight drop-shadow-md">
            {currentTrack.bengaliTitle || currentTrack.title}
          </h4>
          <p className="font-sans text-[8px] md:text-[9px] uppercase tracking-[0.1em] text-neutral-300 truncate mt-0.5 drop-shadow-md">
            {currentTrack.bengaliBandName || currentTrack.bandName}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-1.5 z-10 pr-2 flex-shrink-0">
          <button 
            onClick={togglePlay}
            className="text-white hover:scale-105 active:scale-95 transition-transform w-7 h-7 md:w-8 md:h-8 flex items-center justify-center relative bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                {isPlaying ? <Pause size={14} className="fill-current md:w-4 md:h-4 w-3.5 h-3.5" /> : <Play size={14} className="fill-current ml-0.5 md:w-4 md:h-4 w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          <button onClick={toggleLyrics} className="text-neutral-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full backdrop-blur-md">
            <Mic2 size={14} strokeWidth={2} className="md:w-[15px] md:h-[15px] w-3.5 h-3.5" />
          </button>
          
          <button onClick={playNext} className="text-neutral-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full backdrop-blur-md">
            <SkipForward size={14} strokeWidth={2} className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={toggleQueue}
            className="text-neutral-300 hover:text-white transition-colors p-1.5 ml-0.5 hover:bg-white/10 rounded-full backdrop-blur-md"
          >
            <ListMusic size={14} strokeWidth={2} className="md:w-[15px] md:h-[15px] w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
