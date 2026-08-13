import { NowPlaying } from './NowPlaying';
import { QueueDrawer } from './QueueDrawer';
import { YouTubePlayerAdapter } from './YouTubePlayerAdapter';
import { usePlayerStore } from '../../store/playerStore';
import { useEffect } from 'react';

export function PlayerShell() {
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const loadFeaturedTracks = usePlayerStore(state => state.loadFeaturedTracks);

  useEffect(() => {
    loadFeaturedTracks();
  }, [loadFeaturedTracks]);
  
  return (
    <div className="relative min-h-screen bg-[#0C0D0E] flex flex-col text-white font-sans overflow-hidden selection:bg-white/20">
      <YouTubePlayerAdapter />
      
      {/* Top Header */}
      <header className="w-full flex items-center justify-between px-6 py-8 z-10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] font-bengali">BANDGHOR</h1>
          <p className="text-neutral-500 text-xs tracking-widest mt-1 uppercase">বাংলা ব্যান্ডের ঘর</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-emerald-500' : 'bg-neutral-600'}`}></span>
            </span>
            <span className="tabular-nums">47 listening now</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex w-full relative z-10 flex-col overflow-y-auto">
        <NowPlaying />
        
        {/* Discovery Strip */}
        <div className="w-full max-w-6xl mx-auto px-6 pb-12 mt-auto">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-neutral-500 mb-6 font-sans">
            Tonight's Selection
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
            {usePlayerStore.getState().queue.map((track, idx) => (
              <button 
                key={track.id}
                onClick={() => usePlayerStore.getState().play(track)}
                className="flex-none w-32 md:w-40 flex flex-col text-left group snap-start"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-3 bg-neutral-900 border border-white/5">
                  <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center pl-1 scale-75 group-hover:scale-100 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </span>
                  </div>
                </div>
                <h4 className="font-bengali text-sm font-medium text-white truncate w-full group-hover:text-emerald-400 transition-colors">{track.bengaliTitle || track.title}</h4>
                <p className="font-bengali text-xs text-neutral-500 truncate w-full">{track.bengaliBandName || track.bandName}</p>
              </button>
            ))}
          </div>
        </div>
      </main>

      <QueueDrawer />

      {/* Background ambient effect */}
      <div className="fixed inset-0 pointer-events-none -z-10">
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
