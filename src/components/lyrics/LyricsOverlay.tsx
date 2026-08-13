import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Loader2, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useLyrics } from '../../hooks/useLyrics';
import { LyricLine } from '../../types';

function getActiveLyricIndex(lines: LyricLine[], currentTime: number) {
  let low = 0;
  let high = lines.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lines[mid].startTime <= currentTime) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}

export function LyricsOverlay() {
  const isLyricsOpen = usePlayerStore(s => s.isLyricsOpen);
  const toggleLyrics = usePlayerStore(s => s.toggleLyrics);
  const currentTrack = usePlayerStore(s => s.currentTrack);
  const activeColor = usePlayerStore(s => s.customThemeColor || s.dominantColor) || '255,255,255';
  
  const { lyricsData, state, error } = useLyrics();
  
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const activeIndexRef = useRef(activeIndex);
  const isAutoScrollingRef = useRef(isAutoScrolling);
  
  // Keep refs in sync with state for rAF loop closure
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  
  useEffect(() => {
    isAutoScrollingRef.current = isAutoScrolling;
  }, [isAutoScrolling]);

  // requestAnimationFrame loop for lyrics synchronization
  useEffect(() => {
    if (!isLyricsOpen || state !== 'SYNCED' || !lyricsData?.lines) return;
    
    let rafId: number;
    let lastUpdateTime = 0;
    
    const updateLoop = (timestamp: number) => {
      // Throttle React state updates to every 200ms to minimize re-renders
      if (timestamp - lastUpdateTime > 200) {
        const currentProgress = usePlayerStore.getState().progress;
        const newIndex = getActiveLyricIndex(lyricsData.lines!, currentProgress);
        
        if (newIndex !== activeIndexRef.current) {
          setActiveIndex(newIndex);
          
          if (isAutoScrollingRef.current && activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
        lastUpdateTime = timestamp;
      }
      rafId = requestAnimationFrame(updateLoop);
    };
    
    rafId = requestAnimationFrame(updateLoop);
    
    return () => cancelAnimationFrame(rafId);
  }, [isLyricsOpen, state, lyricsData]);

  // Handle manual scroll
  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (isAutoScrollingRef.current) {
      setIsAutoScrolling(false);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      // Don't auto-resume immediately
    }, 100);
  };

  const resumeAutoScroll = () => {
    setIsAutoScrolling(true);
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <AnimatePresence>
      {isLyricsOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-3xl overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(${activeColor}, 0.15), transparent 70%), 
                             radial-gradient(ellipse at 50% 100%, rgba(${activeColor}, 0.1), transparent 70%)`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:px-12 md:py-8 shrink-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded overflow-hidden shadow-2xl bg-neutral-900 border border-white/10">
                {currentTrack?.artworkUrl && (
                  <img src={currentTrack.artworkUrl} alt="Cover" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-bengali text-base md:text-xl truncate max-w-[200px] md:max-w-md drop-shadow-md">
                  {currentTrack?.bengaliTitle || currentTrack?.title}
                </h2>
                <p className="text-neutral-400 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] truncate">
                  {currentTrack?.bengaliBandName || currentTrack?.bandName}
                </p>
              </div>
            </div>
            
            <button 
              onClick={toggleLyrics}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all group backdrop-blur-md"
            >
              <X size={20} className="text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2} />
            </button>
          </div>

          {/* Content Area with Mask Image for fading */}
          <div 
            ref={scrollContainerRef}
            onWheel={handleScroll}
            onTouchMove={handleScroll}
            className="flex-1 overflow-y-auto hide-scrollbar px-6 md:px-24 pb-48 pt-24 relative z-0"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
            }}
          >
            {state === 'LOADING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <Loader2 size={40} className="text-white/40 animate-spin" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-[0.3em] font-sans text-neutral-500">Syncing Lyrics...</p>
              </div>
            )}
            
            {state === 'NOT_FOUND' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-6">
                <FileText size={56} className="text-white/10 mb-2" strokeWidth={1} />
                <h3 className="text-3xl font-bengali text-white/60">লিরিক্স পাওয়া যায়নি</h3>
                <p className="text-xs uppercase tracking-widest font-sans text-neutral-500 max-w-sm">
                  We couldn't find lyrics for this track in the current archive.
                </p>
              </div>
            )}

            {state === 'ERROR' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center px-6">
                <FileText size={56} className="text-red-500/30 mb-2" strokeWidth={1} />
                <h3 className="text-2xl font-sans text-red-400/80 tracking-wide">Connection Error</h3>
                <p className="text-xs tracking-widest font-sans text-neutral-500 max-w-sm">
                  {error}
                </p>
              </div>
            )}

            {state === 'PLAIN_ONLY' && lyricsData?.plainText && (
              <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-16 backdrop-blur-md">
                  <FileText size={12} className="text-white/60" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-sans">Plain text only</span>
                </div>
                <div className="whitespace-pre-wrap font-bengali text-2xl md:text-4xl text-white/80 leading-loose md:leading-[2.5]">
                  {lyricsData.plainText}
                </div>
              </div>
            )}

            {state === 'SYNCED' && lyricsData?.lines && (
              <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-14 min-h-full py-[40vh]">
                {lyricsData.lines.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  const isPast = idx < activeIndex;
                  
                  return (
                    <div
                      key={line.id + idx}
                      ref={isActive ? activeLineRef : null}
                      className={`text-center transition-all duration-500 origin-center ${
                        isActive ? 'text-white scale-105 opacity-100 blur-none' : 
                        isPast ? 'text-neutral-400 scale-95 opacity-25 blur-[2px]' : 
                        'text-neutral-400 scale-95 opacity-30 blur-[2px]'
                      }`}
                      style={{
                        textShadow: isActive ? `0 0 30px rgba(${activeColor}, 0.8), 0 0 60px rgba(${activeColor}, 0.4)` : 'none'
                      }}
                    >
                      <p className={`font-bengali leading-tight tracking-tight transition-all duration-500 ${
                        isActive ? 'text-4xl md:text-5xl lg:text-7xl font-medium' : 'text-3xl md:text-4xl lg:text-5xl font-normal'
                      }`}>
                        {line.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sync status / manual scroll resume */}
          <AnimatePresence>
            {state === 'SYNCED' && !isAutoScrolling && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50"
              >
                <button
                  onClick={resumeAutoScroll}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-sans text-[10px] uppercase tracking-widest font-medium transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <RefreshCw size={14} />
                  Resume Sync
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
