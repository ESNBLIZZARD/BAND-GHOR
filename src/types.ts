export interface Track {
  id: string;
  title: string;
  bengaliTitle: string;
  bandName: string;
  bengaliBandName?: string;
  albumTitle?: string;
  releaseYear?: number;
  durationSeconds: number; // approximate duration for UI before YT loads
  youtubeVideoId: string;
  artworkUrl: string;
}

export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

export interface PlayerState {
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
  isMuted: boolean;
}

export interface LyricLine {
  id: string;
  startTime: number;
  text: string;
}

export interface LyricsResponse {
  found: boolean;
  synced: boolean;
  source: "lrclib" | "other" | null;
  lines: LyricLine[];
  plainText?: string;
  error?: string;
}
