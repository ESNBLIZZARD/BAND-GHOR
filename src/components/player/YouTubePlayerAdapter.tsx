import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

let errorSkipCount = 0;
let lastErrorTimestamp = 0;

export function YouTubePlayerAdapter() {
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const volume = usePlayerStore(state => state.volume);
  const isMuted = usePlayerStore(state => state.isMuted);
  
  const setProgress = usePlayerStore(state => state.setProgress);
  const setDuration = usePlayerStore(state => state.setDuration);
  const setBuffering = usePlayerStore(state => state.setBuffering);
  const playNext = usePlayerStore(state => state.playNext);
  const pause = usePlayerStore(state => state.pause);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
  }, []);

  // Initialize Player when API is ready
  useEffect(() => {
    if (isApiReady && !playerRef.current) {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          vq: 'small',
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            if (volume !== undefined) event.target.setVolume(volume);
            if (isMuted) event.target.mute();
          },
          onStateChange: (event: any) => {
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                setBuffering(false);
                setDuration(event.target.getDuration());
                // Attempt to force lowest quality to save bandwidth (though modern YT uses ABR, this is a strong hint)
                if (event.target.setPlaybackQuality) {
                  event.target.setPlaybackQuality('small');
                }
                if (!usePlayerStore.getState().isPlaying) {
                  usePlayerStore.getState().play();
                }
                break;
              case window.YT.PlayerState.PAUSED:
                setBuffering(false);
                if (usePlayerStore.getState().isPlaying) {
                  usePlayerStore.getState().pause();
                }
                break;
              case window.YT.PlayerState.BUFFERING:
                setBuffering(true);
                break;
              case window.YT.PlayerState.ENDED:
                playNext();
                break;
              default:
                break;
            }
          },
          onError: (event: any) => {
            console.error('YouTube Player Error:', event.data);
            if (event.data === 150 || event.data === 101) {
              console.warn("Embedding is disabled for this track. Auto-skipping if safe...");
            }
            
            const store = usePlayerStore.getState();
            window.dispatchEvent(new CustomEvent('youtube-player-error', { detail: event.data }));

            const now = Date.now();
            if (now - lastErrorTimestamp > 5000) {
              // Reset count if it's been a while since the last error
              errorSkipCount = 0;
            }
            lastErrorTimestamp = now;
            errorSkipCount++;

            if (errorSkipCount <= 3) {
              // Auto-skip
              setTimeout(() => {
                console.log(`Auto-skipping to next track (Attempt ${errorSkipCount}/3)`);
                store.playNext();
              }, 1000); // Slight delay for UX
            } else {
              // Infinite loop prevention
              console.warn("Too many consecutive YouTube errors. Pausing playback to prevent infinite loops.");
              store.pause();
            }
          }
        }
      });
    }
    
    return () => {
      // Don't destroy on unmount to keep playback across potential re-renders
      // but in a real SPA we might manage this differently
    };
  }, [isApiReady]);

  // Sync Current Track
  useEffect(() => {
    if (isPlayerReady && playerRef.current && currentTrack) {
      if (!currentTrack.youtubeVideoId) {
        console.warn("No YouTube Video ID found for this track. Auto-skipping.");
        window.dispatchEvent(new CustomEvent('youtube-player-error', { detail: 'player_unavailable' }));
        
        const now = Date.now();
        if (now - lastErrorTimestamp > 5000) {
          errorSkipCount = 0;
        }
        lastErrorTimestamp = now;
        errorSkipCount++;

        if (errorSkipCount <= 3) {
          setTimeout(() => {
            usePlayerStore.getState().playNext();
          }, 1000);
        } else {
          usePlayerStore.getState().pause();
        }
        return;
      }

      playerRef.current.loadVideoById(currentTrack.youtubeVideoId);
      if (!isPlaying) {
        // If we load but shouldn't play, we have to wait for it to buffer then pause
        // It's tricky with YT API. Usually `cueVideoById` is better if not playing.
        playerRef.current.cueVideoById(currentTrack.youtubeVideoId);
      }
    }
  }, [currentTrack?.id, isPlayerReady]);

  // Sync Play/Pause State
  useEffect(() => {
    if (isPlayerReady && playerRef.current && playerRef.current.getPlayerState) {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isPlayerReady]);

  // Sync Volume
  useEffect(() => {
    if (isPlayerReady && playerRef.current) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    }
  }, [volume, isMuted, isPlayerReady]);

  // Progress Polling & Seek Listener
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isPlayerReady) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 1000);
    }
    
    const handleSeek = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(customEvent.detail, true);
        setProgress(customEvent.detail);
      }
    };
    
    window.addEventListener('player-seek', handleSeek);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('player-seek', handleSeek);
    };
  }, [isPlaying, isPlayerReady, setProgress]);

  // Update Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.bengaliTitle || currentTrack.title,
        artist: currentTrack.bengaliBandName || currentTrack.bandName,
        album: currentTrack.albumTitle,
        artwork: [
          { src: currentTrack.artworkUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().play());
      navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().playNext());
    }
  }, [currentTrack]);

  // Use an absolute 1x1 invisible container instead of `display: none` 
  // because some browsers throttle or pause playback when elements are display: none.
  // The 1x1 size also heavily biases YouTube's Adaptive Bitrate (ABR) algorithm 
  // to fetch the absolute lowest video resolution (144p).
  return (
    <div className="absolute w-px h-px opacity-0 pointer-events-none overflow-hidden">
      <div id="youtube-player"></div>
    </div>
  );
}
