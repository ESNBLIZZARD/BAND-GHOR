import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { LyricsResponse } from '../types';

export type LyricsState = 'LOADING' | 'SYNCED' | 'PLAIN_ONLY' | 'NOT_FOUND' | 'ERROR';

const lyricsCache = new Map<string, LyricsResponse>();

export function useLyrics() {
  const { currentTrack, isLyricsOpen } = usePlayerStore();
  const [lyricsData, setLyricsData] = useState<LyricsResponse | null>(null);
  const [state, setState] = useState<LyricsState>('LOADING');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTrack) {
      setState('NOT_FOUND');
      setLyricsData(null);
      return;
    }

    // Only start fetching if lyrics are actually opened for this track, 
    // to save unnecessary API calls when the user is just listening.
    // If it's cached, we can load it instantly regardless.
    const cacheKey = currentTrack.id;
    if (lyricsCache.has(cacheKey)) {
      const cached = lyricsCache.get(cacheKey)!;
      setLyricsData(cached);
      setState(cached.found ? (cached.synced ? 'SYNCED' : 'PLAIN_ONLY') : 'NOT_FOUND');
      return;
    }

    if (!isLyricsOpen) return;

    let isMounted = true;
    setState('LOADING');
    setError(null);

    const fetchLyrics = async () => {
      try {
        const params = new URLSearchParams({
          track: currentTrack.title || currentTrack.bengaliTitle || '',
          artist: currentTrack.bandName || currentTrack.bengaliBandName || '',
        });

        if (currentTrack.albumTitle) {
          params.append('album', currentTrack.albumTitle);
        }
        if (currentTrack.durationSeconds) {
          params.append('duration', currentTrack.durationSeconds.toString());
        }

        const res = await fetch(`/api/lyrics?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch lyrics');
        }

        const data: LyricsResponse = await res.json();
        
        if (!isMounted) return;
        
        lyricsCache.set(cacheKey, data);

        if (data.found) {
          setLyricsData(data);
          setState(data.synced ? 'SYNCED' : 'PLAIN_ONLY');
        } else {
          setLyricsData(null);
          setState('NOT_FOUND');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Lyrics fetch error:", err);
          setState('ERROR');
          setError(err.message || 'Error fetching lyrics');
        }
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, isLyricsOpen]);

  return { lyricsData, state, error };
}
