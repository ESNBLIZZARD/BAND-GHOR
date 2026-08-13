import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';

export function BandProfile() {
  const { slug } = useParams();
  const [band, setBand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const play = usePlayerStore(state => state.play);
  const setQueue = usePlayerStore(state => state.setQueue);

  useEffect(() => {
    const fetchBand = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bands/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBand(data);
        }
      } catch (err) {
        console.error('Failed to fetch band', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [slug]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-neutral-500 font-bengali animate-pulse">লোড হচ্ছে...</div>;
  }

  if (!band) {
    return <div className="flex-1 flex items-center justify-center text-neutral-500 font-bengali">ব্যান্ড পাওয়া যায়নি।</div>;
  }

  const playAll = () => {
    if (band.tracks && band.tracks.length > 0) {
      setQueue(band.tracks);
      play(band.tracks[0]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-8 py-12 pb-32">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-12 mb-24">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-sm overflow-hidden bg-neutral-900 flex-shrink-0">
          {band.image ? (
            <img src={band.image} alt={band.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-neutral-800 font-bengali bg-neutral-950">
               {band.bengaliName?.[0] || band.name[0]}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <Link to="/" className="text-[10px] font-medium tracking-[0.3em] uppercase text-neutral-500 hover:text-white transition-colors mb-4 font-sans block">Archive / Band</Link>
          <h1 className="text-5xl md:text-7xl font-normal text-white font-bengali mb-6 tracking-tight">
            {band.bengaliName || band.name}
          </h1>
          <p className="text-neutral-500 font-sans text-xs uppercase tracking-widest mb-8">
            {band.originCity} {band.formationYear ? `• EST. ${band.formationYear}` : ''}
          </p>
          <button 
            onClick={playAll}
            className="inline-flex items-center gap-3 text-white uppercase tracking-widest text-xs font-medium hover:text-neutral-300 transition-colors"
          >
            <Play size={16} className="fill-current" />
            Play Archive
          </button>
        </div>
      </div>

      {/* Tracks List */}
      <div className="w-full">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-600 mb-8 font-sans border-b border-white/5 pb-4">
          Selected Recordings
        </h3>
        
        {band.tracks && band.tracks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 pt-4">
            {band.tracks.map((track: Track, idx: number) => (
              <button
                key={track.id}
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
                <p className="font-sans text-[9px] uppercase tracking-[0.15em] text-neutral-600 truncate w-full">{track.durationSeconds ? `${Math.floor(track.durationSeconds / 60)}:${(track.durationSeconds % 60).toString().padStart(2, '0')}` : ''}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600 font-sans text-sm tracking-widest uppercase">No recordings available.</p>
        )}
      </div>
    </div>
  );
}
