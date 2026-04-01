import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Play, Plus, Music, Pause, SkipBack, SkipForward,
  Maximize2, Minimize2, Volume2, Shuffle, Repeat, Repeat1,
  History, Wifi, WifiOff, Loader2, Unlink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import axios from "axios";

export default function Spotify() {
  const { user, checkAuth } = useAuth();
  const {
    currentTrack, isPlaying, volume, shuffle, repeatMode, needsReauth,
    deviceId, playTrack, pauseTrack, skipNext, skipPrev,
    setVolume, toggleShuffle, toggleRepeat, disconnectSpotify, reconnect,
  } = useSpotify();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "recent">("search");
  const [copied, setCopied] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const callbackUrl = `${window.location.origin}/spotify/callback`;

  const showAction = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") {
        checkAuth();
        reconnect();
      } else if (event.data?.type === "SPOTIFY_AUTH_ERROR") {
        setAuthError(event.data.error || "Échec de la connexion à Spotify.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkAuth, reconnect]);

  useEffect(() => {
    if (currentTrack && isFullScreen) {
      setLyricsLoading(true);
      const artist = currentTrack.artists?.[0]?.name;
      const title = currentTrack.name?.split(" - ")[0];
      if (!artist || !title) { setLyricsLoading(false); return; }
      axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
        .then((r) => setLyrics(r.data.lyrics || "Paroles introuvables."))
        .catch(() => setLyrics("Paroles introuvables pour ce titre."))
        .finally(() => setLyricsLoading(false));
    }
  }, [currentTrack?.id, isFullScreen]);

  useEffect(() => {
    if (activeTab === "recent" && user?.hasSpotify) {
      axios.get("/api/spotify/player/recently-played")
        .then((r) => setRecentlyPlayed(r.data || []))
        .catch(() => {});
    }
  }, [activeTab, user?.hasSpotify]);

  const connectSpotify = async () => {
    setAuthError("");
    try {
      const res = await axios.get(`/api/spotify/url?redirectUri=${encodeURIComponent(callbackUrl)}`);
      window.open(res.data.url, "spotify_auth", "width=600,height=700");
    } catch (err: any) {
      setAuthError(err.response?.data?.error || "Échec de la connexion à Spotify.");
    }
  };

  const searchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch { showAction("Recherche échouée."); }
    finally { setLoading(false); }
  };

  const addToPlaylist = async (trackUri: string) => {
    try {
      await axios.post("/api/spotify/playlist/add", { trackUri });
      showAction("Ajouté à la playlist Nexus Dashboard !");
    } catch { showAction("Impossible d'ajouter le titre."); }
  };

  const handlePlayTrack = async (uri?: string) => {
    try { await playTrack(uri); }
    catch { showAction("Impossible de lire. Assurez-vous d'avoir un appareil Spotify actif."); }
  };

  const handleDisconnect = async () => {
    setConfirmDisconnect(false);
    await disconnectSpotify();
    await checkAuth();
    showAction("Spotify déconnecté.");
  };

  const copyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const RepeatIcon = repeatMode === 2 ? Repeat1 : Repeat;

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
              <button onClick={copyCallback} className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors">
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
      {/* Fullscreen player */}
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
              <Minimize2 className="h-4 w-4" /> Réduire
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
                <div className="flex items-center gap-4">
                  <button onClick={toggleShuffle} className={`transition-colors ${shuffle ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}>
                    <Shuffle className="h-5 w-5" />
                  </button>
                  <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors"><SkipBack className="h-8 w-8" /></button>
                  <button
                    onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.5)] hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="h-7 w-7 text-black" /> : <Play className="h-7 w-7 text-black" />}
                  </button>
                  <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward className="h-8 w-8" /></button>
                  <button onClick={toggleRepeat} className={`transition-colors ${repeatMode > 0 ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}>
                    <RepeatIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <Volume2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-[#1DB954]"
                  />
                </div>
              </div>
              <div className="flex-1 h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Paroles</h3>
                {lyricsLoading ? (
                  <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-400" /></div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{lyrics}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Spotify</h1>
          <p className="text-gray-400">Recherchez et gérez votre musique</p>
        </div>
        <div className="flex items-center gap-3">
          {deviceId ? (
            <div className="flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-2 text-sm text-[#1DB954]">
              <Wifi className="h-3.5 w-3.5" />
              Connecté
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-500/10 px-4 py-2 text-sm text-gray-400">
              <WifiOff className="h-3.5 w-3.5" />
              Sans appareil
            </div>
          )}
          <button
            onClick={() => setConfirmDisconnect(true)}
            className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Unlink className="h-3.5 w-3.5" />
            Déconnecter
          </button>
        </div>
      </div>

      {/* Confirm disconnect */}
      <AnimatePresence>
        {confirmDisconnect && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4"
          >
            <p className="text-sm text-red-300">Déconnecter Spotify de Nexus ?</p>
            <div className="flex gap-2">
              <button onClick={handleDisconnect} className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-400 transition-colors">Confirmer</button>
              <button onClick={() => setConfirmDisconnect(false)} className="rounded-lg bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20 transition-colors">Annuler</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Needs reauth */}
      {needsReauth && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5"
        >
          <div>
            <h3 className="font-bold text-yellow-400">Reconnexion requise</h3>
            <p className="text-sm text-yellow-200 mt-1">Votre session Spotify a expiré. Reconnectez pour continuer.</p>
          </div>
          <button onClick={connectSpotify} className="shrink-0 rounded-lg bg-yellow-500 px-5 py-2 font-bold text-black hover:bg-yellow-400 transition-colors">
            Reconnecter
          </button>
        </motion.div>
      )}

      {/* Current track mini player */}
      {currentTrack && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-[#1DB954]/20 bg-[#1DB954]/5 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {currentTrack.album?.images?.[0]?.url && (
                <img src={currentTrack.album.images[0].url} alt="Album" className="h-14 w-14 shrink-0 rounded-xl shadow-[0_0_15px_rgba(29,185,84,0.3)]" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{currentTrack.name}</p>
                <p className="text-sm text-gray-400 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={toggleShuffle} className={`${shuffle ? "text-[#1DB954]" : "text-gray-500 hover:text-white"} transition-colors`} title="Aléatoire">
                <Shuffle className="h-4 w-4" />
              </button>
              <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors"><SkipBack className="h-5 w-5" /></button>
              <button
                onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] hover:scale-105 transition-transform shadow-[0_0_15px_rgba(29,185,84,0.4)]"
              >
                {isPlaying ? <Pause className="h-5 w-5 text-black" /> : <Play className="h-5 w-5 text-black" />}
              </button>
              <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors"><SkipForward className="h-5 w-5" /></button>
              <button onClick={toggleRepeat} className={`${repeatMode > 0 ? "text-[#1DB954]" : "text-gray-500 hover:text-white"} transition-colors`} title="Répéter">
                <RepeatIcon className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 ml-2">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <input
                  type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-[#1DB954]"
                />
              </div>
              <button onClick={() => setIsFullScreen(true)} className="ml-1 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {actionMessage && (
        <div className="mb-4 rounded-lg bg-[#1DB954]/10 p-4 text-sm text-[#1DB954] border border-[#1DB954]/20">{actionMessage}</div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(["search", "recent"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {tab === "search" ? <Search className="h-4 w-4" /> : <History className="h-4 w-4" />}
            {tab === "search" ? "Recherche" : "Récents"}
          </button>
        ))}
      </div>

      {activeTab === "search" && (
        <>
          <form onSubmit={searchTracks} className="mb-6 relative max-w-2xl">
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher des titres, artistes ou albums..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-28 text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all focus:border-[#1DB954] focus:bg-white/10"
            />
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors">
              Rechercher
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="grid gap-3">
              {results.map((track, i) => (
                <motion.div key={track.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {track.album?.images?.[0]?.url && (
                      <img src={track.album.images[0].url} alt="Album" className="h-12 w-12 shrink-0 rounded-lg" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artists?.map((a: any) => a.name).join(", ")} · {track.album?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => handlePlayTrack(track.uri)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.4)] hover:scale-110 transition-transform">
                      <Play className="h-4 w-4 text-black" />
                    </button>
                    <button onClick={() => addToPlaylist(track.uri)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Plus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "recent" && (
        <div className="grid gap-3">
          {recentlyPlayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-12 w-12 text-gray-700 mb-3" />
              <p className="text-gray-500">Aucun titre récent</p>
            </div>
          ) : (
            recentlyPlayed.map((item: any, i: number) => {
              const track = item.track;
              return (
                <motion.div key={`${track.id}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {track.album?.images?.[0]?.url && (
                      <img src={track.album.images[0].url} alt="Album" className="h-12 w-12 shrink-0 rounded-lg" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
                    </div>
                  </div>
                  <button onClick={() => handlePlayTrack(track.uri)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(29,185,84,0.4)] hover:scale-110 transition-all shrink-0">
                    <Play className="h-4 w-4 text-black" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
