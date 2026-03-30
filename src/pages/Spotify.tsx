import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Play, Plus, Music, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export default function Spotify() {
  const { user, checkAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const callbackUrl = `${window.location.origin}/spotify/callback`;

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        const res = await axios.get("/api/spotify/token");
        const token = res.data.token;

        const spotifyPlayer = new window.Spotify.Player({
          name: "Nexus Dashboard Player",
          getOAuthToken: (cb: any) => { cb(token); },
          volume: 0.5,
        });

        setPlayer(spotifyPlayer);

        spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener("player_state_changed", (state: any) => {
          if (!state) return;
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        });

        spotifyPlayer.connect();
      } catch (err) {
        console.error("Failed to initialize Spotify Player", err);
      }
    };

    return () => {
      if (player) player.disconnect();
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [user?.hasSpotify, needsReauth]);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;
    const fetchCurrent = async () => {
      try {
        const res = await axios.get("/api/spotify/player/current");
        if (res.data && res.data.item) {
          setCurrentTrack(res.data.item);
          setIsPlaying(res.data.is_playing);
          setNeedsReauth(false);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) setNeedsReauth(true);
      }
    };
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [user?.hasSpotify, needsReauth]);

  useEffect(() => {
    if (currentTrack && isFullScreen) {
      const fetchLyrics = async () => {
        setLyricsLoading(true);
        try {
          const artist = currentTrack.artists[0].name;
          const title = currentTrack.name.split(" - ")[0];
          const res = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
          setLyrics(res.data.lyrics || "Paroles introuvables.");
        } catch {
          setLyrics("Paroles introuvables pour ce titre.");
        } finally {
          setLyricsLoading(false);
        }
      };
      fetchLyrics();
    }
  }, [currentTrack?.id, isFullScreen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") checkAuth();
      else if (event.data?.type === "SPOTIFY_AUTH_ERROR")
        setAuthError(event.data.error || "Échec de la connexion à Spotify.");
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkAuth]);

  const connectSpotify = async () => {
    setAuthError("");
    try {
      const res = await axios.get(`/api/spotify/url?redirectUri=${encodeURIComponent(callbackUrl)}`);
      window.open(res.data.url, "spotify_auth", "width=600,height=700");
    } catch (err: any) {
      setAuthError(err.response?.data?.error || "Échec de la connexion à Spotify.");
    }
  };

  const playTrack = async (uri?: string) => {
    try {
      await axios.put("/api/spotify/player/play", {
        uris: uri ? [uri] : undefined,
        device_id: deviceId || undefined,
      });
      setIsPlaying(true);
    } catch {
      setActionMessage("Impossible de lire. Assurez-vous d'avoir un appareil Spotify actif ouvert.");
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  const pauseTrack = async () => {
    try { await axios.put("/api/spotify/player/pause"); setIsPlaying(false); } catch (err) { console.error(err); }
  };
  const skipNext = async () => { try { await axios.post("/api/spotify/player/next"); } catch (err) { console.error(err); } };
  const skipPrev = async () => { try { await axios.post("/api/spotify/player/previous"); } catch (err) { console.error(err); } };

  const searchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) { console.error("Search failed", err); }
    finally { setLoading(false); }
  };

  const addToPlaylist = async (trackUri: string) => {
    try {
      await axios.post("/api/spotify/playlist/add", { trackUri });
      setActionMessage("Ajouté à la playlist !");
    } catch { setActionMessage("Impossible d'ajouter le titre."); }
    setTimeout(() => setActionMessage(""), 3000);
  };

  const copyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user?.hasSpotify) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Music className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Connecter Spotify</h2>
          <p className="mb-6 text-gray-400 text-sm leading-relaxed">
            Liez votre compte Spotify pour rechercher des titres, gérer des playlists et contrôler la lecture.
          </p>

          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-left">
            <p className="mb-3 font-bold text-yellow-400 text-sm">⚠️ Configuration requise</p>
            <p className="mb-3 text-sm text-yellow-200">
              Ajoutez cette URL dans votre <strong>Spotify Developer Dashboard</strong> sous <em>Redirect URIs</em>, puis cliquez sur <strong>Save</strong>.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2">
              <code className="flex-1 font-mono text-xs text-emerald-400 break-all">{callbackUrl}</code>
              <button
                onClick={copyCallback}
                className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >
                {copied ? "✓" : "Copier"}
              </button>
            </div>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">{authError}</div>
          )}

          <button
            onClick={connectSpotify}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
          >
            Connecter avec Spotify
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
        {isFullScreen && currentTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl p-8"
          >
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <Minimize2 className="h-4 w-4" /> Quitter
            </button>
            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl w-full">
              <div className="flex flex-col items-center gap-6 shrink-0">
                {currentTrack.album?.images?.[0]?.url && (
                  <img src={currentTrack.album.images[0].url} alt="Album" className="h-64 w-64 rounded-2xl shadow-[0_0_60px_rgba(29,185,84,0.4)]" />
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{currentTrack.name}</p>
                  <p className="text-gray-400 mt-1">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors"><SkipBack className="h-8 w-8" /></button>
                  <button
                    onClick={() => isPlaying ? pauseTrack() : playTrack()}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.5)] hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="h-7 w-7 text-black" /> : <Play className="h-7 w-7 text-black" />}
                  </button>
                  <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward className="h-8 w-8" /></button>
                </div>
              </div>
              <div className="flex-1 h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Paroles</h3>
                {lyricsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{lyrics}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Spotify</h1>
          <p className="text-gray-400">Recherchez et gérez votre musique</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-2 text-sm text-[#1DB954]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]" />
          </span>
          Connecté
        </div>
      </div>

      {needsReauth && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5"
        >
          <div>
            <h3 className="font-bold text-yellow-400">Action requise : Reconnecter Spotify</h3>
            <p className="text-sm text-yellow-200 mt-1">Veuillez reconnecter votre compte pour activer les nouvelles permissions.</p>
          </div>
          <button onClick={connectSpotify} className="shrink-0 rounded-lg bg-yellow-500 px-5 py-2 font-bold text-black hover:bg-yellow-400 transition-colors">
            Reconnecter
          </button>
        </motion.div>
      )}

      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-2xl border border-[#1DB954]/20 bg-[#1DB954]/5 p-4"
        >
          <div className="flex items-center gap-4">
            {currentTrack.album?.images?.[0]?.url && (
              <img src={currentTrack.album.images[0].url} alt="Album" className="h-14 w-14 rounded-xl" />
            )}
            <div>
              <p className="font-semibold text-white">{currentTrack.name}</p>
              <p className="text-sm text-gray-400">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors"><SkipBack className="h-5 w-5" /></button>
            <button
              onClick={() => isPlaying ? pauseTrack() : playTrack()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] hover:scale-105 transition-transform shadow-[0_0_15px_rgba(29,185,84,0.4)]"
            >
              {isPlaying ? <Pause className="h-5 w-5 text-black" /> : <Play className="h-5 w-5 text-black" />}
            </button>
            <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward className="h-5 w-5" /></button>
            <button onClick={() => setIsFullScreen(true)} className="ml-2 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={searchTracks} className="mb-8 relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des titres, artistes ou albums..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-28 text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all focus:border-[#1DB954] focus:bg-white/10"
        />
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
          Rechercher
        </button>
      </form>

      {actionMessage && (
        <div className="mb-6 rounded-lg bg-[#1DB954]/10 p-4 text-sm text-[#1DB954] border border-[#1DB954]/20">{actionMessage}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-center gap-4">
                {track.album?.images?.[0]?.url && (
                  <img src={track.album.images[0].url} alt="Album" className="h-12 w-12 rounded-lg" />
                )}
                <div>
                  <p className="font-medium text-white">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artists?.map((a: any) => a.name).join(", ")} · {track.album?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => playTrack(track.uri)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.4)] hover:scale-110 transition-transform"
                >
                  <Play className="h-4 w-4 text-black" />
                </button>
                <button
                  onClick={() => addToPlaylist(track.uri)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
