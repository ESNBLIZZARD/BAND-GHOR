import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{ tracks: Track[], bands: any[] }>({ tracks: [], bands: [] });
  const [loading, setLoading] = useState(false);
  const play = usePlayerStore(state => state.play);

  useEffect(() => {
    if (!query) {
      setResults({ tracks: [], bands: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 pb-32">
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-neutral-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchParams({ q: e.target.value })}
          placeholder="ব্যান্ড, গান বা অ্যালবামের নাম খুঁজুন..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 font-bengali text-lg transition-all"
        />
      </div>

      {!query && (
        <div className="text-center py-20 text-neutral-500 font-bengali">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-xl">আপনি কী শুনতে চান?</p>
          <p className="text-sm mt-2">Find your favorite Bengali bands and songs</p>
        </div>
      )}

      {loading && query && (
        <div className="text-center py-20 text-neutral-500 font-bengali animate-pulse">
          খোঁজা হচ্ছে...
        </div>
      )}

      {!loading && query && results.bands.length === 0 && results.tracks.length === 0 && (
        <div className="text-center py-20 text-neutral-500 font-bengali">
          <p className="text-xl">কোনও ফলাফল পাওয়া যায়নি।</p>
        </div>
      )}

      {!loading && (results.bands.length > 0 || results.tracks.length > 0) && (
        <div className="space-y-12">
          {/* Bands */}
          {results.bands.length > 0 && (
            <div>
              <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-600 mb-8 font-sans">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                {results.bands.map(band => (
                  <Link key={band.id} to={`/bands/${band.slug}`} className="group text-center">
                    <div className="w-full aspect-square rounded-sm overflow-hidden bg-neutral-900 mb-4 mx-auto max-w-[180px]">
                      {band.image ? (
                         <img src={band.image} alt={band.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-700 font-bengali bg-neutral-900">
                           {band.bengaliName?.[0] || band.name[0]}
                         </div>
                      )}
                    </div>
                    <h4 className="font-bengali text-lg font-normal text-white transition-colors">{band.bengaliName || band.name}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tracks */}
          {results.tracks.length > 0 && (
            <div className="mt-16">
              <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-600 mb-8 font-sans">Archive</h3>
              <div className="flex flex-col gap-0 border-t border-white/5">
                {results.tracks.map(track => (
                  <button
                    key={track.id}
                    onClick={() => play(track)}
                    className="w-full flex items-center gap-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-left group"
                  >
                    <div className="relative w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 bg-neutral-900">
                      <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={18} className="text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bengali text-lg font-normal text-white truncate transition-colors">{track.bengaliTitle || track.title}</p>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 truncate mt-1">{track.bengaliBandName || track.bandName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
