import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, VolumeX, ListMusic, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { formatTime } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function PlayerControls() {
  const { 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious,
    progress,
    duration,
    setProgress,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    repeatMode,
    setRepeatMode,
    toggleQueue,
    isQueueOpen,
    toggleLyrics,
    isLyricsOpen,
    dominantColor,
    customThemeColor
  } = usePlayerStore();

  const activeColor = customThemeColor || dominantColor;

  const [isDragging, setIsDragging] = React.useState(false);
  const [localProgress, setLocalProgress] = React.useState(0);

  React.useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(parseFloat(e.target.value));
  };

  const handleSeekCommit = () => {
    setProgress(localProgress);
    if (window.YT) {
        window.dispatchEvent(new CustomEvent('player-seek', { detail: localProgress }));
    }
    setIsDragging(false);
  };

  const handleRepeatToggle = () => {
    const nextMode = repeatMode === 'NONE' ? 'ALL' : repeatMode === 'ALL' ? 'ONE' : 'NONE';
    setRepeatMode(nextMode);
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-8">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-medium text-neutral-500 font-sans tracking-wider">
        <span>{formatTime(isDragging ? localProgress : progress)}</span>
        <div className="relative flex-1 h-[2px] bg-neutral-900 rounded-none group cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={isDragging ? localProgress : progress}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div 
            className="absolute left-0 top-0 h-full rounded-none transition-colors duration-500"
            style={{ 
              width: `${duration ? ((isDragging ? localProgress : progress) / duration) * 100 : 0}%`,
              backgroundColor: activeColor ? `rgba(${activeColor}, 0.8)` : '#d4d4d4',
              boxShadow: activeColor ? `0 0 10px rgba(${activeColor}, 0.5)` : 'none'
            }}
          />
        </div>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Main Controls row for Mobile (centered play buttons) */}
      <div className="flex items-center justify-between sm:justify-center sm:gap-8 w-full mb-1 sm:mb-0">
        <button className="text-neutral-600 hover:text-white transition-colors sm:hidden">
          <Shuffle size={18} strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <button onClick={playPrevious} className="text-neutral-400 hover:text-white transition-colors">
            <SkipBack size={20} strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="flex items-center justify-center text-black bg-white hover:scale-105 active:scale-95 transition-all duration-500 w-10 h-10 sm:w-14 sm:h-14 rounded-full relative shadow-lg"
            style={{
              boxShadow: (isPlaying && activeColor) ? `0 0 40px rgba(${activeColor}, 0.6)` : 'none'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                {isPlaying ? <Pause strokeWidth={1.5} className="fill-current w-5 h-5 sm:w-6 sm:h-6" /> : <Play strokeWidth={1.5} className="fill-current ml-1 w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          <button onClick={playNext} className="text-neutral-400 hover:text-white transition-colors">
            <SkipForward size={20} strokeWidth={1.5} />
          </button>
        </div>

        <button 
          onClick={handleRepeatToggle}
          className={`${repeatMode !== 'NONE' ? 'text-white' : 'text-neutral-600 hover:text-white'} transition-colors sm:hidden`}
        >
          {repeatMode === 'ONE' ? <Repeat1 size={18} strokeWidth={1.5} /> : <Repeat size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Secondary Controls (Volume / Queue / Lyrics / Extra toggles for desktop) */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 w-1/3">
          <div className="hidden sm:flex items-center gap-3 group">
            <button onClick={toggleMute} className="text-neutral-500 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            </button>
            
            <div className="relative w-16 md:w-20 h-[2px] bg-neutral-900 rounded-none cursor-pointer flex items-center transition-colors">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <motion.div 
                className="absolute left-0 top-0 h-full rounded-none transition-colors duration-500"
                style={{ 
                  width: `${isMuted ? 0 : volume}%`,
                  backgroundColor: activeColor ? `rgba(${activeColor}, 0.6)` : '#a3a3a3'
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-6 text-neutral-600">
          <button className="hover:text-white transition-colors">
            <Shuffle size={16} strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleRepeatToggle}
            className={`${repeatMode !== 'NONE' ? 'text-white' : 'hover:text-white'} transition-colors`}
          >
            {repeatMode === 'ONE' ? <Repeat1 size={16} strokeWidth={1.5} /> : <Repeat size={16} strokeWidth={1.5} />}
          </button>
        </div>

        <div className="flex justify-end gap-5 w-full sm:w-1/3">
          <button 
            onClick={toggleLyrics}
            className={`${isLyricsOpen ? 'text-white' : 'text-neutral-500 hover:text-white'} transition-colors`}
            title="Lyrics"
          >
            <Mic2 size={18} strokeWidth={1.5} />
          </button>
          <button 
            onClick={toggleQueue}
            className={`${isQueueOpen ? 'text-white' : 'text-neutral-500 hover:text-white'} transition-colors`}
            title="Queue"
          >
            <ListMusic size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
