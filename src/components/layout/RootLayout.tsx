import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { QueueDrawer } from '../player/QueueDrawer';
import { LyricsOverlay } from '../lyrics/LyricsOverlay';
import { YouTubePlayerAdapter } from '../player/YouTubePlayerAdapter';
import { usePlayerStore } from '../../store/playerStore';
import { TopNav } from './TopNav';
import { MiniPlayer } from '../player/MiniPlayer';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { extractDominantColor } from '../../lib/colorUtils';

export function RootLayout() {
  const { loadFeaturedTracks, play, currentTrack, setDominantColor, customThemeColor, dominantColor } = usePlayerStore();

  const activeColor = customThemeColor || dominantColor;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isHome = location.pathname === '/';
  const [isInitializing, setIsInitializing] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const songIdToPlay = searchParams.get('songId');

  useEffect(() => {
    const handleError = (e: any) => {
      setPlayerError("Track unavailable due to playback restrictions. Skipping...");
      setTimeout(() => setPlayerError(null), 3000);
    };
    window.addEventListener('youtube-player-error', handleError);
    return () => window.removeEventListener('youtube-player-error', handleError);
  }, []);

  const queueParam = searchParams.get('queue');
  const hasAttemptedPlay = useRef(false);

  useEffect(() => {
    if (currentTrack?.artworkUrl) {
      extractDominantColor(currentTrack.artworkUrl).then(color => {
        setDominantColor(color);
      });
    }
  }, [currentTrack?.artworkUrl, setDominantColor]);

  useEffect(() => {
    // Start fetching and apply an artificial aesthetic delay
    Promise.all([
      loadFeaturedTracks(),
      new Promise(resolve => setTimeout(resolve, 2500))
    ]).then(async () => {
      setIsInitializing(false);
      
      if (!hasAttemptedPlay.current) {
        hasAttemptedPlay.current = true;
        
        if (queueParam) {
           const trackIds = queueParam.split(',');
           try {
             // Fetch all tracks in parallel
             const trackPromises = trackIds.map(id => 
               fetch(`/api/tracks/${id}`).then(res => res.ok ? res.json() : null)
             );
             const tracks = (await Promise.all(trackPromises)).filter(Boolean);
             if (tracks.length > 0) {
               usePlayerStore.getState().setQueue(tracks);
               usePlayerStore.getState().play(tracks[0]);
             }
           } catch (error) {
             console.error("Failed to load shared queue", error);
           }
        } else if (songIdToPlay) {
          try {
            const res = await fetch(`/api/tracks/${songIdToPlay}`);
            if (res.ok) {
              const track = await res.json();
              play(track);
            }
          } catch (error) {
            console.error("Failed to auto-play shared track", error);
          }
        } else {
          // Default: play first track
          const queue = usePlayerStore.getState().queue;
          if (queue.length > 0) {
            usePlayerStore.getState().play(queue[0]);
          }
        }
      }
    });
  }, [loadFeaturedTracks, songIdToPlay, queueParam, play]);

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col text-[#F0F0F0] font-sans overflow-hidden selection:bg-white/20">
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 mb-8 rounded-full border-t-2 border-b-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] opacity-80"
              />
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6"
              >
                Initializing
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="text-4xl md:text-6xl font-normal text-white uppercase tracking-[0.2em] font-sans"
              >
                Bandghor
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <YouTubePlayerAdapter />
      
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1 flex w-full relative z-10 flex-col overflow-y-auto">
        <Outlet />
      </main>

      <LyricsOverlay />
      <QueueDrawer />

      {/* Sticky Bottom Player when not on Home */}
      {!isHome && <MiniPlayer />}

      <AnimatePresence>
        {playerError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl shadow-red-900/50 border border-red-500/30 backdrop-blur-md"
          >
            {playerError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background ambient effect */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-black">
        <motion.div
          key="fallback-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src="/bg.png" 
            alt="Background" 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540039155733-d76e6148eb86?q=80&w=3000&auto=format&fit=crop'; }}
            className="w-full h-full object-cover opacity-100" 
          />
        </motion.div>
        
        {/* Concert Lighting Effects */}
        <div className="absolute inset-0 overflow-hidden mix-blend-screen opacity-70 pointer-events-none z-0">
          {/* Left Spotlight */}
          <div
            className="absolute -bottom-[20%] -left-[20%] w-[150vw] h-[150vh] origin-bottom-left animate-sweep-left"
            style={{
              background: `conic-gradient(from 0deg at 0% 100%, transparent 0deg, rgba(${activeColor || '255,255,255'}, 0.4) 20deg, transparent 40deg)`,
            }}
          />
          {/* Right Spotlight */}
          <div
            className="absolute -bottom-[20%] -right-[20%] w-[150vw] h-[150vh] origin-bottom-right animate-sweep-right"
            style={{
              background: `conic-gradient(from 270deg at 100% 100%, transparent 0deg, rgba(${activeColor || '255,255,255'}, 0.4) 20deg, transparent 40deg)`,
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-[60vw] h-[40vw] rounded-t-full blur-[100px] animate-flicker"
            style={{ backgroundColor: `rgba(${activeColor || '255,255,255'}, 0.8)` }}
          />
        </div>

        {/* Theme color overlay */}
        <div 
          className="absolute inset-0 mix-blend-color transition-colors duration-1000"
          style={{ backgroundColor: activeColor ? `rgba(${activeColor}, 0.5)` : 'transparent' }}
        />
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ backgroundColor: activeColor ? `rgba(${activeColor}, 0.05)` : 'transparent' }}
        />

        {/* Gradients to fade edges into black */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0)_70%)]" />

        {/* Grain overlay for analog feel */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>
    </div>
  );
}
