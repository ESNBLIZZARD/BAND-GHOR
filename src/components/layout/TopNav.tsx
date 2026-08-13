import { Link, useLocation } from 'react-router-dom';
import { Search, X, ArrowLeft, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function TopNav() {
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const activeListeners = usePlayerStore(state => state.activeListeners);
  const syncPresence = usePlayerStore(state => state.syncPresence);
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Initial sync
    syncPresence();
    
    // Poll every 10 seconds
    const interval = setInterval(() => {
      syncPresence();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [syncPresence, isPlaying]); // include isPlaying to trigger on play state change

  return (
    <header className="w-full flex items-center justify-between px-4 py-4 md:px-8 md:py-8 z-20 sticky top-0 bg-transparent">
      <Link to="/" className="group flex flex-col">
        <h1 className="text-lg md:text-2xl font-normal tracking-[0.3em] font-sans text-white transition-colors">BANDGHOR</h1>
        <p className="text-neutral-500 text-[9px] md:text-[10px] tracking-widest mt-1 uppercase font-bengali">বাংলা ব্যান্ডের ঘর</p>
      </Link>
      
      <div className="flex items-center gap-6 md:gap-8">
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
          <span className="relative flex h-1.5 w-1.5">
            {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isPlaying ? 'bg-white' : 'bg-neutral-700'}`}></span>
          </span>
          <span className="tabular-nums">{activeListeners} listening</span>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {!isHomePage ? (
              <motion.div
                key="back"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  to="/" 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all group backdrop-blur-md"
                >
                  {isSearchPage ? (
                    <X size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  ) : (
                    <ArrowLeft size={18} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
                  )}
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.8, rotate: 90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: -90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Link 
                  to="/import" 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-neutral-400 hover:text-white transition-colors group"
                  title="Import Playlist"
                >
                  <ListMusic size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                </Link>
                <Link 
                  to="/search" 
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-neutral-400 hover:text-white transition-colors group"
                  title="Search"
                >
                  <Search size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
