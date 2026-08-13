import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, RepeatMode } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeatMode: RepeatMode;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  isMuted: boolean;
  activeListeners: number;
  dominantColor: string | null;
  customThemeColor: string | null;
  
  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setBuffering: (isBuffering: boolean) => void;
  setQueue: (tracks: Track[]) => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setDominantColor: (color: string | null) => void;
  setCustomThemeColor: (color: string | null) => void;
  loadFeaturedTracks: () => Promise<void>;
  syncPresence: () => Promise<void>;
}

// Generate a random client ID for this session
const CLIENT_ID = Math.random().toString(36).substring(2, 15);

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      isBuffering: false,
      volume: 80,
      progress: 0,
      duration: 0,
      repeatMode: 'NONE',
      isQueueOpen: false,
      isLyricsOpen: false,
      isMuted: false,
      activeListeners: 42,
      dominantColor: null,
      customThemeColor: null,

      setDominantColor: (color) => set({ dominantColor: color }),
      setCustomThemeColor: (color) => set({ customThemeColor: color }),

      syncPresence: async () => {
        try {
          const res = await fetch('/api/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              clientId: CLIENT_ID, 
              isPlaying: get().isPlaying 
            })
          });
          const data = await res.json();
          if (data && typeof data.count === 'number') {
            set({ activeListeners: data.count });
          }
        } catch (error) {
          // Silent fail for analytics
        }
      },

      loadFeaturedTracks: async () => {
        try {
          const res = await fetch('/api/tracks/featured');
          const data: Track[] = await res.json();
          if (data && data.length > 0) {
            // Ensure Khoro Amar is first
            const khoroAmarIndex = data.findIndex(t => t.id === 'fossils-khnoro-aamar-fossil' || (t as any).slug === 'khnoro-aamar-fossil' || t.id === 't28');
            if (khoroAmarIndex > 0) {
              const khoroAmar = data.splice(khoroAmarIndex, 1)[0];
              data.unshift(khoroAmar);
            }
            set({
              queue: data,
              currentTrack: data[0],
              queueIndex: 0,
              duration: data[0].durationSeconds || 0,
            });
          }
        } catch (err) {
          console.error("Failed to load featured tracks", err);
        }
      },

      play: (track) => {
        if (track) {
          const queue = get().queue;
          const index = queue.findIndex(t => t.id === track.id);
          
          let newQueue = queue;
          let newIndex = index;
          
          if (index === -1) {
            newQueue = [track, ...queue];
            newIndex = 0;
          }
          
          set({ 
             queue: newQueue,
             currentTrack: track, 
             isPlaying: true, 
             progress: 0,
             queueIndex: newIndex
          });
        } else {
          set({ isPlaying: true });
        }
      },
      
      pause: () => set({ isPlaying: false }),
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      playNext: () => {
        const { queue, queueIndex, repeatMode } = get();
        if (queue.length === 0) return;
        
        let nextIndex = queueIndex + 1;
        if (nextIndex >= queue.length) {
          if (repeatMode === 'ALL') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false, progress: 0 });
            return;
          }
        }
        
        set({ 
          queueIndex: nextIndex, 
          currentTrack: queue[nextIndex],
          isPlaying: true,
          progress: 0
        });
      },
      
      playPrevious: () => {
        const { queue, queueIndex, progress } = get();
        if (queue.length === 0) return;
        
        // If we're more than 3 seconds in, just restart the song
        if (progress > 3) {
          set({ progress: 0 }); // The YouTube API adapter will need to react to this
          return;
        }
        
        let prevIndex = queueIndex - 1;
        if (prevIndex < 0) {
          prevIndex = queue.length - 1;
        }
        
        set({
          queueIndex: prevIndex,
          currentTrack: queue[prevIndex],
          isPlaying: true,
          progress: 0
        });
      },
      
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setBuffering: (isBuffering) => set({ isBuffering }),
      setQueue: (queue) => set({ queue }),
      toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
      toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
      setRepeatMode: (repeatMode) => set({ repeatMode })
    }),
    {
      name: 'bandghor-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted,
        repeatMode: state.repeatMode
      }),
    }
  )
);
