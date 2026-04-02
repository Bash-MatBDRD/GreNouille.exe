import { Router } from "express";
import axios from "axios";
import db from "../db.js";
import { authenticateToken } from "./auth.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

async function syncSpotifyToSupabase(supabaseId: string, accessToken: string, refreshToken: string, expiry: number) {
  if (!supabaseId) return;
  try {
    await supabaseAdmin.auth.admin.updateUserById(supabaseId, {
      user_metadata: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
        spotifyTokenExpiry: expiry,
      },
    });
  } catch {
    // Non-blocking
  }
}

const router = Router();

// Get Spotify Auth URL
router.get("/url", authenticateToken, (req: any, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: "Spotify Client ID is not configured in Secrets." });

  const redirectUri = req.query.redirectUri as string;
  if (!redirectUri) return res.status(400).json({ error: "redirectUri is required" });

  // Added playback scopes
  const scope = "user-read-private user-read-email playlist-modify-public playlist-modify-private user-modify-playback-state user-read-playback-state user-read-currently-playing";
  
  const stateObj = { userId: req.user.id, redirectUri };
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
  });

  res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
});

// Spotify Callback (called by frontend)
router.post("/callback", async (req, res) => {
  const { code, state } = req.body;
  
  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  let userId;
  let redirectUri;
  try {
    const stateObj = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
    userId = stateObj.userId;
    redirectUri = stateObj.redirectUri;
  } catch (e) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const expiry = Date.now() + expires_in * 1000;

    // Save tokens to DB
    const stmt = db.prepare(
      "UPDATE users SET spotifyAccessToken = ?, spotifyRefreshToken = ?, spotifyTokenExpiry = ? WHERE id = ?"
    );
    stmt.run(access_token, refresh_token, expiry, userId);

    // Sync to Supabase metadata for persistence across cold starts
    const dbUser = db.prepare("SELECT supabase_id FROM users WHERE id = ?").get(userId) as any;
    if (dbUser?.supabase_id) {
      syncSpotifyToSupabase(dbUser.supabase_id, access_token, refresh_token, expiry);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Spotify token exchange error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to exchange token" });
  }
});

// Helper to get valid token
async function getValidSpotifyToken(userId: number) {
  const stmt = db.prepare("SELECT spotifyAccessToken, spotifyRefreshToken, spotifyTokenExpiry FROM users WHERE id = ?");
  const user = stmt.get(userId) as any;

  if (!user || !user.spotifyAccessToken) return null;

  if (Date.now() > user.spotifyTokenExpiry) {
    // Refresh token
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: user.spotifyRefreshToken,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
        }
      );

      const { access_token, refresh_token: new_refresh, expires_in } = response.data;
      const expiry = Date.now() + expires_in * 1000;
      const finalRefresh = new_refresh || user.spotifyRefreshToken;

      db.prepare("UPDATE users SET spotifyAccessToken = ?, spotifyRefreshToken = ?, spotifyTokenExpiry = ? WHERE id = ?")
        .run(access_token, finalRefresh, expiry, userId);

      const dbUser = db.prepare("SELECT supabase_id FROM users WHERE id = ?").get(userId) as any;
      if (dbUser?.supabase_id) {
        syncSpotifyToSupabase(dbUser.supabase_id, access_token, finalRefresh, expiry);
      }

      return access_token;
    } catch (err) {
      console.error("Error refreshing Spotify token", err);
      return null;
    }
  }

  return user.spotifyAccessToken;
}

// Get Spotify Token for Web Playback SDK
router.get("/token", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  res.json({ token });
});

// Search Tracks
router.get("/search", authenticateToken, async (req: any, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=track&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data.tracks.items);
  } catch (err) {
    res.status(500).json({ error: "Failed to search Spotify" });
  }
});

// Add Track to Playlist
router.post("/playlist/add", authenticateToken, async (req: any, res) => {
  const { trackUri } = req.body;
  if (!trackUri) return res.status(400).json({ error: "Track URI required" });

  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    // 1. Get User Profile
    const meRes = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const spotifyUserId = meRes.data.id;

    // 2. Check for existing Nexus playlist
    const playlistsRes = await axios.get("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    let playlistId = playlistsRes.data.items.find((p: any) => p.name === "Nexus Dashboard")?.id;

    // 3. Create if not exists
    if (!playlistId) {
      const createRes = await axios.post(
        `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
        { name: "Nexus Dashboard", description: "Created via Nexus Dashboard", public: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      playlistId = createRes.data.id;
    }

    // 4. Add track
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: [trackUri] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, message: "Track added to Nexus Dashboard playlist" });
  } catch (err: any) {
    console.error("Failed to add track", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to add track to playlist" });
  }
});

// Playback Controls
router.get("/player/current", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data || { is_playing: false });
  } catch (err: any) {
    const status = err.response?.status || 500;
    if (status !== 401 && status !== 403) {
      console.error("Current track error:", err.response?.data || err.message);
    }
    res.status(status).json({ error: "Failed to get current track" });
  }
});

router.get("/player/devices", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/devices", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(response.data.devices);
  } catch (err: any) {
    const status = err.response?.status || 500;
    if (status !== 401 && status !== 403) {
      console.error("Devices error:", err.response?.data || err.message);
    }
    res.status(status).json({ error: "Failed to get devices" });
  }
});

router.put("/player/play", authenticateToken, async (req: any, res) => {
  const { uris, device_id } = req.body;
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    const url = device_id ? `https://api.spotify.com/v1/me/player/play?device_id=${device_id}` : "https://api.spotify.com/v1/me/player/play";
    await axios.put(url, uris ? { uris } : {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    const status = err.response?.status || 500;
    if (status !== 401 && status !== 403 && status !== 404) {
      console.error("Play error:", err.response?.data || err.message);
    }
    res.status(status).json({ error: err.response?.data?.error?.message || "Failed to play" });
  }
});

router.put("/player/pause", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    await axios.put("https://api.spotify.com/v1/me/player/pause", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Pause error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "Failed to pause" });
  }
});

router.post("/player/next", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    await axios.post("https://api.spotify.com/v1/me/player/next", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Next error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "Failed to skip" });
  }
});

router.post("/player/previous", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });

  try {
    await axios.post("https://api.spotify.com/v1/me/player/previous", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Prev error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: "Failed to go back" });
  }
});

router.put("/player/volume", authenticateToken, async (req: any, res) => {
  const { volume_percent } = req.query;
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume_percent}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to set volume" });
  }
});

router.put("/player/shuffle", authenticateToken, async (req: any, res) => {
  const { state } = req.query;
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to toggle shuffle" });
  }
});

router.put("/player/repeat", authenticateToken, async (req: any, res) => {
  const { state } = req.query;
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to set repeat" });
  }
});

router.get("/player/recently-played", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    const r = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(r.data.items);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to get recently played" });
  }
});

router.get("/player/saved", authenticateToken, async (req: any, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "ids required" });
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    const r = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(r.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to check saved tracks" });
  }
});

router.put("/player/save", authenticateToken, async (req: any, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put("https://api.spotify.com/v1/me/tracks", { ids }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to save track" });
  }
});

router.delete("/player/save", authenticateToken, async (req: any, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.delete("https://api.spotify.com/v1/me/tracks", {
      data: { ids },
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to unsave track" });
  }
});

router.put("/player/transfer", authenticateToken, async (req: any, res) => {
  const { device_id, play } = req.body;
  if (!device_id) return res.status(400).json({ error: "device_id required" });
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put("https://api.spotify.com/v1/me/player", { device_ids: [device_id], play: play ?? false }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to transfer playback" });
  }
});

router.get("/player/queue", authenticateToken, async (req: any, res) => {
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    const r = await axios.get("https://api.spotify.com/v1/me/player/queue", {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(r.data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to get queue" });
  }
});

router.post("/player/seek", authenticateToken, async (req: any, res) => {
  const { position_ms } = req.body;
  if (position_ms === undefined) return res.status(400).json({ error: "position_ms required" });
  const token = await getValidSpotifyToken(req.user.id);
  if (!token) return res.status(401).json({ error: "Spotify not connected" });
  try {
    await axios.put(`https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: "Failed to seek" });
  }
});

router.post("/disconnect", authenticateToken, async (req: any, res) => {
  try {
    db.prepare("UPDATE users SET spotifyAccessToken = NULL, spotifyRefreshToken = NULL, spotifyTokenExpiry = NULL WHERE id = ?").run(req.user.id);
    if (req.user.supabaseId) {
      supabaseAdmin.auth.admin.updateUserById(req.user.supabaseId, {
        user_metadata: { spotifyAccessToken: null, spotifyRefreshToken: null, spotifyTokenExpiry: null },
      }).catch(() => {});
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to disconnect Spotify" });
  }
});

export default router;
