import { NowPlaying } from '../components/player/NowPlaying';
import { usePlayerStore } from '../store/playerStore';
import { Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function Home() {
  const { queue, play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [bands, setBands] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/bands')
      .then(res => res.json())
      .then(data => setBands(data))
      .catch(console.error);
  }, []);
  

  const handleStartListening = () => {
    if (queue.length > 0 && !currentTrack) {
      play(queue[0]);
    } else if (currentTrack) {
      togglePlay();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!currentTrack ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 flex flex-col items-center justify-center w-full px-6 md:px-12 mt-[-5vh] z-10 relative"
          >
            {/* Landing Hero */}
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto z-20">
              <p className="text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase text-neutral-500 mb-6 font-sans">
                The Archive of Bengali Rock
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-normal text-white tracking-tighter mb-8 font-sans leading-none uppercase">
                Bandghor
              </h1>
              <p className="text-sm md:text-base text-neutral-400 max-w-lg mx-auto mb-12 font-bengali leading-relaxed">
                বাংলা ব্যান্ডের এক অসীম আর্কাইভ। হারিয়ে যাওয়া ক্যাসেটের ফিতে থেকে শুরু করে আজকের ডিজিটাল রিলিজ—সবই এক ছাদের নিচে।
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={handleStartListening}
                  className="group relative inline-flex items-center justify-center gap-4 bg-white text-black px-12 py-5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white via-neutral-200 to-white animate-pulse" />
                  <span className="relative z-10 text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
                    Start Listening
                  </span>
                  <Play size={16} className="relative z-10 fill-current" />
                </button>
                
                <Link
                  to="/import"
                  className="group relative inline-flex items-center justify-center gap-4 bg-transparent border border-white/20 hover:border-white/60 text-white px-10 py-5 rounded-full overflow-hidden transition-all hover:scale-105 hover:bg-white/5 active:scale-95"
                >
                  <span className="relative z-10 text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
                    Import Playlist
                  </span>
                </Link>
              </div>
            </div>

            {/* Discovery Strip at the bottom */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute bottom-0 left-0 right-0 w-full max-w-[90rem] mx-auto px-8 pb-12 z-20 hidden md:block"
            >
              
              <div className="w-full border-t border-white/10 pt-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-500">
                    Band Catalogues
                  </h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6 pb-6">
                  {bands.slice(0, 10).map((band, idx) => (
                    <Link 
                      to={`/bands/${band.slug}`}
                      key={band.id + idx}
                      className="flex-none flex flex-col text-left group"
                    >
                      <div className="w-full aspect-square rounded-full overflow-hidden relative mb-4 bg-neutral-900 border border-white/5 flex items-center justify-center">
                        {band.image ? (
                          <img src={band.image} alt={band.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                        ) : (
                          <span className="text-4xl text-neutral-800 font-bengali group-hover:text-white transition-colors">{band.bengaliName?.[0] || band.name[0]}</span>
                        )}
                      </div>
                      <h4 className="font-bengali text-sm font-normal text-white/90 truncate w-full transition-colors leading-tight mb-1 text-center">{band.bengaliName || band.name}</h4>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full border-t border-white/10 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-500">
                    Featured Archives
                  </h3>
                  <Link to="/search" className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-2 transition-colors">
                    Explore All <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-6 pb-6">
                  {queue.slice(0, 24).map((track, idx) => (
                    <button 
                      key={track.id + idx}
                      onClick={() => play(track)}
                      className="flex-none flex flex-col text-left group"
                    >
                      <div className="w-full aspect-square rounded-sm overflow-hidden relative mb-4 bg-neutral-900 border border-white/5 flex items-center justify-center">
                        {track.artworkUrl ? (
                          <img src={track.artworkUrl} alt={track.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                        ) : (
                          <span className="text-4xl text-neutral-800 font-bengali group-hover:text-white transition-colors">🎵</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={24} className="text-white fill-current shadow-2xl" />
                        </div>
                      </div>
                      <h4 className="font-bengali text-sm font-normal text-white/90 truncate w-full transition-colors leading-tight mb-1">{track.bengaliTitle || track.title}</h4>
                      <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-neutral-600 truncate w-full">{track.bengaliBandName || track.bandName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="now-playing"
            initial={{ opacity: 0, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 w-full flex flex-col relative z-20"
          >
            {/* Main NowPlaying component */}
            <NowPlaying />
            
            {/* Secondary queue context below the player */}
            <div className="w-full max-w-[90rem] mx-auto px-8 pb-16 mt-auto hidden lg:block">
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-600 mb-8 font-sans">
                  Up Next from Archive
                </h3>
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
                  {queue.filter(t => t.id !== currentTrack.id).map((track, idx) => (
                    <button 
                      key={track.id + idx}
                      onClick={() => play(track)}
                      className="flex-none w-32 md:w-36 flex flex-col text-left group snap-start opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <div className="w-full aspect-square rounded-sm overflow-hidden relative mb-4 bg-neutral-900 border border-white/5">
                        <img src={track.artworkUrl} alt={track.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={24} className="text-white fill-current shadow-2xl" />
                        </div>
                      </div>
                      <h4 className="font-bengali text-sm font-normal text-white/90 truncate w-full transition-colors leading-tight mb-1">{track.bengaliTitle || track.title}</h4>
                      <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-neutral-600 truncate w-full">{track.bengaliBandName || track.bandName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
