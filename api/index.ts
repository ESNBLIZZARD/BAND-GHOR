import express from "express";
import { db } from "../src/db/index.js";
import { tracks, bands } from "../src/db/schema.js";
import { eq, ilike, or } from "drizzle-orm";

const app = express();
app.use(express.json());

// In-memory presence tracker
const activeSessions = new Map<string, number>();

// In-memory server cache for lyrics
const serverLyricsCache = new Map();
const LYRICS_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get featured tracks
app.get("/api/tracks/featured", async (req, res) => {
  try {
    const featuredTracks = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        bengaliTitle: tracks.bengaliTitle,
        bandName: bands.name,
        bengaliBandName: bands.bengaliName,
        youtubeVideoId: tracks.youtubeVideoId,
        durationSeconds: tracks.durationSeconds,
        artworkUrl: tracks.artworkUrl,
      })
      .from(tracks)
      .innerJoin(bands, eq(tracks.bandId, bands.id))
      .where(eq(tracks.featured, true));

    res.json(featuredTracks);
  } catch (error: any) {
    console.error("Failed to fetch tracks:", error);
    res.status(500).json({ error: error.message || "Failed to fetch tracks" });
  }
});

// Get track by id
app.get("/api/tracks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trackRows = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        bengaliTitle: tracks.bengaliTitle,
        bandName: bands.name,
        bengaliBandName: bands.bengaliName,
        youtubeVideoId: tracks.youtubeVideoId,
        durationSeconds: tracks.durationSeconds,
        artworkUrl: tracks.artworkUrl,
      })
      .from(tracks)
      .innerJoin(bands, eq(tracks.bandId, bands.id))
      .where(eq(tracks.id, id))
      .limit(1);

    if (trackRows.length === 0) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.json(trackRows[0]);
  } catch (error: any) {
    console.error("Failed to fetch track:", error);
    res.status(500).json({ error: error.message || "Failed to fetch track" });
  }
});

// Get band by slug
app.get("/api/bands/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const band = await db.query.bands.findFirst({
      where: eq(bands.slug, slug),
      with: {
        tracks: true
      }
    });

    if (!band) {
      return res.status(404).json({ error: "Band not found" });
    }

    const mappedTracks = band.tracks.map(t => ({
      ...t,
      bandName: band.name,
      bengaliBandName: band.bengaliName
    }));

    res.json({ ...band, tracks: mappedTracks });
  } catch (error: any) {
    console.error("Failed to fetch band:", error);
    res.status(500).json({ error: error.message || "Failed to fetch band" });
  }
});

app.post("/api/presence", (req, res) => {
  const { clientId, isPlaying } = req.body;
  if (clientId && isPlaying) {
    activeSessions.set(clientId, Date.now());
  } else if (clientId && !isPlaying) {
    activeSessions.delete(clientId);
  }
  
  const now = Date.now();
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 15000) {
      activeSessions.delete(id);
    }
  }
  
  res.json({ count: 42 + activeSessions.size });
});

app.get("/api/presence", (req, res) => {
  const now = Date.now();
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 15000) {
      activeSessions.delete(id);
    }
  }
  res.json({ count: 42 + activeSessions.size });
});

app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.json({ tracks: [], bands: [] });
    }
    
    const searchPattern = `%${q}%`;

    const matchedBands = await db
      .select()
      .from(bands)
      .where(
        or(
          ilike(bands.name, searchPattern),
          ilike(bands.bengaliName, searchPattern)
        )
      )
      .limit(10);

    const matchedTracks = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        bengaliTitle: tracks.bengaliTitle,
        bandName: bands.name,
        bengaliBandName: bands.bengaliName,
        youtubeVideoId: tracks.youtubeVideoId,
        durationSeconds: tracks.durationSeconds,
        artworkUrl: tracks.artworkUrl,
      })
      .from(tracks)
      .innerJoin(bands, eq(tracks.bandId, bands.id))
      .where(
        or(
          ilike(tracks.title, searchPattern),
          ilike(tracks.bengaliTitle, searchPattern),
          ilike(bands.name, searchPattern)
        )
      )
      .limit(20);

    res.json({ bands: matchedBands, tracks: matchedTracks });
  } catch (error: any) {
    console.error("Search failed:", error);
    res.status(500).json({ error: error.message || "Search failed" });
  }
});

app.get("/api/lyrics", async (req, res) => {
  try {
    const { track, artist } = req.query;
    if (!track) {
      return res.status(400).json({ found: false, error: "Track title is required" });
    }

    const normalizedTrack = (track as string).replace(/\([^)]+\)/g, '').replace(/\[[^]]+\]/g, '').trim();
    const normalizedArtist = (artist as string || '').trim();
    const cacheKey = `${normalizedTrack.toLowerCase()}|${normalizedArtist.toLowerCase()}`;

    const cached = serverLyricsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < LYRICS_CACHE_TTL)) {
      return res.json(cached.data);
    }
    
    const q = `${normalizedTrack} ${normalizedArtist}`.trim();

    if (q.toLowerCase().includes('khoro') || q.includes('খড়ো') || q.includes('খোঁড়ো')) {
      const customLyrics = {
        found: true,
        synced: true,
        source: "internal",
        plainText: "ভেসে যাচ্ছি এবং\nভিজে যাচ্ছি আবার\nএক অপূর্ব অসম্ভবে\nশোনো, তুমি কি আমার হবে?\nবলো, তুমি কি আমার?\nশোনো, তুমি কি আমার হবে?\nআজও তুমি কি আমার?\n\nতীরে এসো সাহসিনী\nঅথবা ডুবে যাও\nএই আবেগের মহোৎসবে\nশোনো, তুমি কি আমার হবে?\nবলো, তুমি কি আমার?\nশোনো, তুমি কি আমার হবে?\nআজও তুমি কি আমার?",
        lines: [
          { id: "0", startTime: 10, text: "ভেসে যাচ্ছি এবং" },
          { id: "1", startTime: 15, text: "ভিজে যাচ্ছি আবার" },
          { id: "2", startTime: 20, text: "এক অপূর্ব অসম্ভবে" },
          { id: "3", startTime: 25, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "4", startTime: 30, text: "বলো, তুমি কি আমার?" },
          { id: "5", startTime: 35, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "6", startTime: 40, text: "আজও তুমি কি আমার?" },
          { id: "7", startTime: 50, text: "তীরে এসো সাহসিনী" },
          { id: "8", startTime: 55, text: "অথবা ডুবে যাও" },
          { id: "9", startTime: 60, text: "এই আবেগের মহোৎসবে" },
          { id: "10", startTime: 65, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "11", startTime: 70, text: "বলো, তুমি কি আমার?" },
          { id: "12", startTime: 75, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "13", startTime: 80, text: "আজও তুমি কি আমার?" },
          { id: "14", startTime: 90, text: "মাঝে মাঝে দেখি তোকে" },
          { id: "15", startTime: 95, text: "অতীতে ফিরি পলকে" },
          { id: "16", startTime: 100, text: "আর নতুন কোনও স্তবকে" },
          { id: "17", startTime: 105, text: "বন্দি হয় সে অনুভব" },
          { id: "18", startTime: 110, text: "অন্ধ হয়ে যেতাম যদি" },
          { id: "19", startTime: 115, text: "কল্পনার নিজস্ব নদী" },
          { id: "20", startTime: 120, text: "অন্ধকার সমুদ্রে মিশে" },
          { id: "21", startTime: 125, text: "জানাতো ফেরাটা অসম্ভব" },
          { id: "22", startTime: 135, text: "খোঁড়ো আমার ফসিল" },
          { id: "23", startTime: 140, text: "অনুভূতির মিছিল" },
          { id: "24", startTime: 145, text: "প্রতিক্রিয়াশীল কোনও বিপ্লবে" },
          { id: "25", startTime: 150, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "26", startTime: 155, text: "বলো, তুমি কি আমার?" },
          { id: "27", startTime: 160, text: "শোনো, তুমি কি আমার হবে?" },
          { id: "28", startTime: 165, text: "আজও তুমি কি আমার?" }
        ]
      };
      serverLyricsCache.set(cacheKey, { data: customLyrics, timestamp: Date.now() });
      return res.json(customLyrics);
    }

    const lrclibUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
    
    const lrclibRes = await fetch(lrclibUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!lrclibRes.ok) {
      throw new Error(`LRCLIB error: ${lrclibRes.status}`);
    }

    const searchResults = await lrclibRes.json();
    
    const emptyResult = { found: false, synced: false, source: null, lines: [] };
    if (!searchResults || searchResults.length === 0) {
      serverLyricsCache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
      return res.json(emptyResult);
    }

    let data = searchResults.find((r: any) => r.syncedLyrics);
    if (!data) {
      data = searchResults.find((r: any) => r.plainLyrics);
    }
    
    if (!data) {
      serverLyricsCache.set(cacheKey, { data: emptyResult, timestamp: Date.now() });
      return res.json(emptyResult);
    }

    const lines = [];
    let synced = false;
    
    if (data.syncedLyrics) {
      synced = true;
      const rawLines = data.syncedLyrics.split('\n');
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) continue;
        
        const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          const text = match[3].trim();
          lines.push({
            id: i.toString(),
            startTime: minutes * 60 + seconds,
            text
          });
        } else {
           const match2 = line.match(/^\[(\d+):(\d+)\](.*)/);
           if (match2) {
             const minutes = parseInt(match2[1], 10);
             const seconds = parseFloat(match2[2]);
             const text = match2[3].trim();
             lines.push({
               id: i.toString(),
               startTime: minutes * 60 + seconds,
               text
             });
           }
        }
      }
    }

    const responseData = {
      found: true,
      synced,
      source: "lrclib",
      lines,
      plainText: data.plainLyrics
    };

    serverLyricsCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    res.json(responseData);
  } catch (error: any) {
    console.error("Lyrics API Error:", error);
    if (error.name === 'AbortError') {
       return res.status(504).json({ found: false, error: "Lyrics provider timeout" });
    }
    res.status(500).json({ found: false, error: "Failed to fetch lyrics" });
  }
});

app.get("/api/youtube/playlist", async (req, res) => {
  try {
    const playlistId = req.query.playlistId as string;
    if (!playlistId) {
      return res.status(400).json({ error: "Playlist ID is required" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YouTube API key is not configured" });
    }

    const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
    if (!playlistRes.ok) {
      const errData = await playlistRes.json();
      console.error("YouTube API error:", errData);
      if (playlistRes.status === 403 || playlistRes.status === 429) {
        return res.status(429).json({ error: "Playlist importing is temporarily unavailable. Please try again later." });
      }
      return res.status(404).json({ error: "This playlist is private or unavailable." });
    }
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return res.status(404).json({ error: "This playlist doesn't contain any playable tracks." });
    }

    const snippet = playlistData.items[0].snippet;
    const playlistInfo = {
      source: 'youtube',
      playlistId,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      channelTitle: snippet.channelTitle,
      tracks: [] as any[]
    };

    let nextPageToken = "";
    let fetchedTracks = 0;
    const maxTracks = 50; 

    while (fetchedTracks < maxTracks) {
      const itemsRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`);
      if (!itemsRes.ok) break;

      const itemsData = await itemsRes.json();
      if (!itemsData.items || itemsData.items.length === 0) break;

      for (const item of itemsData.items) {
        if (fetchedTracks >= maxTracks) break;
        
        const isAvailable = item.status?.privacyStatus === 'public' || item.status?.privacyStatus === 'unlisted';
        const videoTitle = item.snippet.title;
        const isDeleted = videoTitle === 'Private video' || videoTitle === 'Deleted video';

        playlistInfo.tracks.push({
          source: 'youtube',
          videoId: item.snippet.resourceId.videoId,
          position: item.snippet.position,
          title: videoTitle,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          channelTitle: item.snippet.videoOwnerChannelTitle,
          available: isAvailable && !isDeleted
        });
        fetchedTracks++;
      }

      if (itemsData.nextPageToken) {
        nextPageToken = itemsData.nextPageToken;
      } else {
        break;
      }
    }

    res.json({ success: true, playlist: playlistInfo });
  } catch (error: any) {
    console.error("Playlist import failed:", error);
    res.status(500).json({ error: "Couldn't load the playlist. Check your connection and try again." });
  }
});

export default app;
