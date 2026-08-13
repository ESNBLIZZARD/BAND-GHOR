export interface ImportedYouTubeTrack {
  source: 'youtube';
  videoId: string;
  position: number;
  title: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  available: boolean;
}

export interface ImportedYouTubePlaylist {
  source: 'youtube';
  playlistId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  tracks: ImportedYouTubeTrack[];
}
