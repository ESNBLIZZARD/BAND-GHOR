import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { parseYouTubePlaylistUrl } from '../features/playlist-import/parseYouTubePlaylistUrl';
import { ImportedYouTubePlaylist } from '../features/playlist-import/types';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Loader2, Music } from 'lucide-react';

export function ImportPlaylist() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<ImportedYouTubePlaylist | null>(null);
  
  const setQueue = usePlayerStore(state => state.setQueue);
  const play = usePlayerStore(state => state.play);
  const navigate = useNavigate();

  const handleLoad = async () => {
    setError('');
    const parsed = parseYouTubePlaylistUrl(url);
    
    if (!parsed.valid) {
      setError(parsed.error || 'Invalid URL');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/youtube/playlist?playlistId=${parsed.playlistId}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to load playlist');
      } else if (data.success && data.playlist) {
        setPlaylist(data.playlist);
      }
    } catch (err) {
      setError("Couldn't load the playlist. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartListening = () => {
    if (!playlist) return;

    const playableTracks = playlist.tracks.filter(t => t.available);
    if (playableTracks.length === 0) {
      setError("No playable tracks were found in this playlist.");
      return;
    }

    const mappedTracks: Track[] = playableTracks.map(t => ({
      id: `yt-${t.videoId}`,
      title: t.title,
      bengaliTitle: t.title,
      bandName: t.channelTitle || 'YouTube Playlist',
      durationSeconds: 0,
      youtubeVideoId: t.videoId,
      artworkUrl: t.thumbnailUrl || playlist.thumbnailUrl || 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=1000'
    }));

    setQueue(mappedTracks);
    play(mappedTracks[0]);
    navigate('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-24 min-h-screen flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!playlist ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl text-center space-y-12"
          >
            <div>
              <h1 className="text-3xl md:text-5xl font-normal tracking-[0.2em] font-sans uppercase mb-4 text-white">
                Listen from a Playlist
              </h1>
              <p className="text-neutral-400 font-sans tracking-widest uppercase text-xs">
                Bring a YouTube playlist into the BandGhor room.
              </p>
            </div>

            <div className="space-y-6">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube playlist URL..."
                className="w-full bg-transparent border-b border-neutral-800 text-center text-white text-sm tracking-widest placeholder:text-neutral-700 py-4 focus:outline-none focus:border-white transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              />
              
              {error && (
                <p className="text-red-400 text-xs tracking-widest uppercase font-sans">{error}</p>
              )}

              <button 
                onClick={handleLoad}
                disabled={isLoading || !url}
                className="group relative inline-flex items-center justify-center px-12 py-4 text-xs font-medium tracking-[0.3em] uppercase overflow-hidden bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Load Playlist"
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
            <div className="flex flex-col items-center text-center max-w-2xl mb-16">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-sm overflow-hidden mb-8 shadow-2xl relative">
                {playlist.thumbnailUrl ? (
                  <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                    <Music size={48} className="text-neutral-700" />
                  </div>
                )}
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bengali font-normal text-white leading-tight mb-4">
                {playlist.title}
              </h2>
              
              <div className="flex items-center gap-3 text-neutral-500 font-sans tracking-[0.2em] uppercase text-[10px] mb-8">
                <span>YouTube Playlist</span>
                <span>•</span>
                <span>{playlist.tracks.length} tracks</span>
                <span>•</span>
                <span>{playlist.channelTitle}</span>
              </div>

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={handleStartListening}
                  className="group flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-neutral-200 transition-colors uppercase text-[10px] tracking-[0.3em] font-medium"
                >
                  <Play size={16} className="fill-current" />
                  Start Listening
                </button>
                
                <div className="flex flex-col items-center gap-3 mt-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-sans">
                    Customize Player Theme
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => usePlayerStore.getState().setCustomThemeColor(null)} className="w-6 h-6 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center hover:border-white transition-colors" title="Dynamic (Artwork)">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-blue-400 to-red-400" />
                    </button>
                    <button onClick={() => usePlayerStore.getState().setCustomThemeColor('15, 23, 42')} className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 hover:border-white transition-colors" title="Slate" />
                    <button onClick={() => usePlayerStore.getState().setCustomThemeColor('69, 10, 10')} className="w-6 h-6 rounded-full bg-red-950 border border-red-900 hover:border-white transition-colors" title="Crimson" />
                    <button onClick={() => usePlayerStore.getState().setCustomThemeColor('6, 78, 59')} className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-900 hover:border-white transition-colors" title="Emerald" />
                    <button onClick={() => usePlayerStore.getState().setCustomThemeColor('49, 46, 129')} className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-900 hover:border-white transition-colors" title="Indigo" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-3xl space-y-2 border-t border-white/10 pt-12">
              <h3 className="text-neutral-600 font-sans text-xs uppercase tracking-[0.3em] mb-6 px-4">
                Tracks
              </h3>
              {playlist.tracks.map((track, i) => (
                <div 
                  key={track.videoId + i}
                  className={`flex items-center gap-6 p-4 border-b border-white/5 ${!track.available ? 'opacity-30' : 'hover:bg-white/5'}`}
                >
                  <span className="text-neutral-600 font-sans text-[10px] w-6">{String(i + 1).padStart(2, '0')}</span>
                  
                  <div className="w-10 h-10 bg-neutral-900 flex-shrink-0">
                    {track.thumbnailUrl && (
                      <img src={track.thumbnailUrl} alt={track.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm truncate font-bengali ${!track.available ? 'line-through' : 'text-white'}`}>
                      {track.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest truncate font-sans mt-1">
                      {track.channelTitle || 'Unknown'}
                    </span>
                  </div>
                  
                  {!track.available && (
                    <span className="text-neutral-500 text-[9px] uppercase tracking-widest border border-neutral-700 px-2 py-1">
                      Unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
