export interface ParsedYouTubePlaylist {
  valid: boolean;
  playlistId?: string;
  error?: string;
}

export function parseYouTubePlaylistUrl(url: string): ParsedYouTubePlaylist {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: "Empty input" };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return { valid: false, error: "Invalid URL format" };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    const isYouTube = hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com';

    if (!isYouTube) {
      return { valid: false, error: "Not a YouTube URL" };
    }

    if (parsedUrl.pathname !== '/playlist') {
      return { valid: false, error: "Not a YouTube playlist URL" };
    }

    const playlistId = parsedUrl.searchParams.get('list');

    if (!playlistId) {
      return { valid: false, error: "No playlist ID found in URL" };
    }

    return { valid: true, playlistId };
  } catch (err) {
    return { valid: false, error: "Malformed URL" };
  }
}
