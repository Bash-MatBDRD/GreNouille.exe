import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Play, Plus, Music, Pause, SkipBack, SkipForward,
  Maximize2, Minimize2, Volume2, VolumeX, Volume1,
  Shuffle, Repeat, Repeat1, History, Wifi, WifiOff,
  Loader2, Unlink, Heart, MonitorSpeaker, Smartphone,
  Monitor, Speaker, Laptop, ChevronDown, ListMusic,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import axios from "axios";

function formatMs(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function DeviceIcon({ type }: { type: string }) {
  const t = (type || "").toLowerCase();
  if (t.includes("smartphone") || t.includes("phone")) return <Smartphone className="h-4 w-4" />;
  if (t.includes("computer") || t.includes("laptop")) return <Laptop className="h-4 w-4" />;
  if (t.includes("speaker")) return <Speaker className="h-4 w-4" />;
  if (t.includes("tv") || t.includes("cast") || t.includes("chromecast")) return <Monitor className="h-4 w-4" />;
  return <MonitorSpeaker className="h-4 w-4" />;
}

export default function Spotify() {
  const { user, checkAuth } = useAuth();
  const {
    currentTrack, isPlaying, volume, shuffle, repeatMode, needsReauth,
    deviceId, progress, duration, devices, likedIds,
    playTrack, pauseTrack, skipNext, skipPrev,
    setVolume, toggleShuffle, toggleRepeat, disconnectSpotify, reconnect,
    transferPlayback, fetchDevices, toggleLike, seekTo,
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
  const [showDevices, setShowDevices] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [seekDragging, setSeekDragging] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volMuted, setVolMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.5);

  const devicesRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!seekDragging) setSeekValue(progress);
  }, [progress, seekDragging]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (devicesRef.current && !devicesRef.current.contains(e.target as Node)) {
        setShowDevices(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleOpenDevices = async () => {
    setShowDevices((v) => !v);
    if (!showDevices) {
      setLoadingDevices(true);
      await fetchDevices();
      setLoadingDevices(false);
    }
  };

  const handleTransfer = async (id: string) => {
    await transferPlayback(id);
    setShowDevices(false);
  };

  const handleMuteToggle = () => {
    if (volMuted) {
      setVolMuted(false);
      setVolume(prevVol);
    } else {
      setPrevVol(volume);
      setVolMuted(true);
      setVolume(0);
    }
  };

  const VolumeIcon = volMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Fullscreen player */}
      <AnimatePresence>
        {isFullScreen && currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-black backdrop-blur-2xl"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
              >
                <ChevronDown className="h-4 w-4" /> Réduire
              </button>
              <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">En écoute</span>
              <div className="w-24" />
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col lg:flex-row items-center gap-10 px-8 pb-6 overflow-auto">
              {/* Left: art + controls */}
              <div className="flex flex-col items-center gap-6 lg:w-80 shrink-0">
                <motion.div
                  key={currentTrack.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  {currentTrack.album?.images?.[0]?.url && (
                    <img
                      src={currentTrack.album.images[0].url}
                      alt="Album"
                      className="h-64 w-64 rounded-2xl shadow-[0_0_80px_rgba(29,185,84,0.35)]"
                    />
                  )}
                </motion.div>

                {/* Track info + like */}
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-white truncate">{currentTrack.name}</p>
                    <p className="text-gray-400 text-sm truncate mt-0.5">
                      {currentTrack.artists?.map((a: any) => a.name).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleLike(currentTrack.id)}
                    className={`shrink-0 transition-all hover:scale-110 ${likedIds.has(currentTrack.id) ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}
                  >
                    <Heart className={`h-6 w-6 ${likedIds.has(currentTrack.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Seek bar */}
                <div className="w-full">
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    value={seekDragging ? seekValue : progress}
                    onChange={(e) => { setSeekDragging(true); setSeekValue(Number(e.target.value)); }}
                    onMouseUp={(e) => { setSeekDragging(false); seekTo(Number((e.target as HTMLInputElement).value)); }}
                    onTouchEnd={(e) => { setSeekDragging(false); seekTo(Number((e.target as HTMLInputElement).value)); }}
                    className="w-full accent-[#1DB954] h-1"
                    style={{ cursor: "pointer" }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatMs(seekDragging ? seekValue : progress)}</span>
                    <span>{formatMs(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  <button onClick={toggleShuffle} className={`transition-colors ${shuffle ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`} title="Aléatoire">
                    <Shuffle className="h-5 w-5" />
                  </button>
                  <button onClick={skipPrev} className="text-gray-300 hover:text-white hover:scale-110 transition-all">
                    <SkipBack className="h-8 w-8" />
                  </button>
                  <button
                    onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause className="h-7 w-7 text-black" /> : <Play className="h-7 w-7 text-black ml-1" />}
                  </button>
                  <button onClick={skipNext} className="text-gray-300 hover:text-white hover:scale-110 transition-all">
                    <SkipForward className="h-8 w-8" />
                  </button>
                  <button onClick={toggleRepeat} className={`transition-colors ${repeatMode > 0 ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`} title={repeatMode === 2 ? "Répéter 1" : repeatMode === 1 ? "Répéter tout" : "Répéter"}>
                    <RepeatIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 w-full">
                  <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors">
                    <VolumeIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={volMuted ? 0 : volume}
                    onChange={(e) => { setVolMuted(false); setVolume(parseFloat(e.target.value)); }}
                    className="flex-1 accent-[#1DB954]"
                  />
                </div>
              </div>

              {/* Right: lyrics */}
              <div className="flex-1 h-full max-h-[400px] lg:max-h-full overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-[#1DB954]" /> Paroles
                </h3>
                {lyricsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{lyrics}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6 pb-0">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Spotify</h1>
            <p className="text-gray-400 text-sm mt-0.5">Musique, playlists et contrôle de lecture</p>
          </div>
          <div className="flex items-center gap-2">
            {deviceId ? (
              <div className="flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-3 py-1.5 text-xs text-[#1DB954]">
                <Wifi className="h-3 w-3" /> Connecté
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-500/10 px-3 py-1.5 text-xs text-gray-400">
                <WifiOff className="h-3 w-3" /> Sans appareil
              </div>
            )}
            <button
              onClick={() => setConfirmDisconnect(true)}
              className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Unlink className="h-3 w-3" /> Déconnecter
            </button>
          </div>
        </div>

        <AnimatePresence>
          {confirmDisconnect && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4"
            >
              <p className="text-sm text-red-300">Déconnecter Spotify de Nexus ?</p>
              <div className="flex gap-2">
                <button onClick={handleDisconnect} className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-400 transition-colors">Confirmer</button>
                <button onClick={() => setConfirmDisconnect(false)} className="rounded-lg bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20 transition-colors">Annuler</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {needsReauth && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
          >
            <div>
              <h3 className="font-bold text-yellow-400">Reconnexion requise</h3>
              <p className="text-sm text-yellow-200 mt-0.5">Session Spotify expirée.</p>
            </div>
            <button onClick={connectSpotify} className="shrink-0 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400 transition-colors text-sm">
              Reconnecter
            </button>
          </motion.div>
        )}

        {actionMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 rounded-xl bg-[#1DB954]/10 p-3 text-sm text-[#1DB954] border border-[#1DB954]/20"
          >
            {actionMessage}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1 w-fit">
          {(["search", "recent"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? "bg-white/10 text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              {tab === "search" ? <Search className="h-4 w-4" /> : <History className="h-4 w-4" />}
              {tab === "search" ? "Recherche" : "Récents"}
            </button>
          ))}
        </div>

        {activeTab === "search" && (
          <>
            <form onSubmit={searchTracks} className="mb-5 relative max-w-2xl">
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Titres, artistes, albums..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-28 text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all focus:border-[#1DB954]/50 focus:bg-white/10"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1DB954] px-4 py-1.5 text-sm font-semibold text-black hover:bg-[#1ed760] transition-colors">
                Rechercher
              </button>
            </form>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" /></div>
            ) : (
              <div className="space-y-1 pb-4">
                {results.map((track, i) => (
                  <motion.div key={track.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/8 cursor-default"
                  >
                    <span className="w-5 text-center text-xs text-gray-500 group-hover:hidden">{i + 1}</span>
                    <button
                      onClick={() => handlePlayTrack(track.uri)}
                      className="w-5 hidden group-hover:flex items-center justify-center"
                    >
                      <Play className="h-3.5 w-3.5 text-white" />
                    </button>
                    {track.album?.images?.[0]?.url && (
                      <img src={track.album.images[0].url} alt="Album" className="h-10 w-10 shrink-0 rounded-md" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{track.name}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artists?.map((a: any) => a.name).join(", ")} · {track.album?.name}</p>
                    </div>
                    <span className="text-xs text-gray-500 hidden group-hover:block mr-2">
                      {formatMs(track.duration_ms)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => toggleLike(track.id)}
                        className={`p-1.5 rounded-full transition-all hover:scale-110 ${likedIds.has(track.id) ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}
                        title="J'aime"
                      >
                        <Heart className={`h-4 w-4 ${likedIds.has(track.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => addToPlaylist(track.uri)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-white transition-colors"
                        title="Ajouter à la playlist"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "recent" && (
          <div className="space-y-1 pb-4">
            {recentlyPlayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <History className="h-12 w-12 text-gray-700 mb-3" />
                <p className="text-gray-500">Aucun titre récent</p>
              </div>
            ) : (
              recentlyPlayed.map((item: any, i: number) => {
                const track = item.track;
                return (
                  <motion.div key={`${track.id}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/8"
                  >
                    <span className="w-5 text-center text-xs text-gray-500 group-hover:hidden">{i + 1}</span>
                    <button onClick={() => handlePlayTrack(track.uri)} className="w-5 hidden group-hover:flex items-center justify-center">
                      <Play className="h-3.5 w-3.5 text-white" />
                    </button>
                    {track.album?.images?.[0]?.url && (
                      <img src={track.album.images[0].url} alt="Album" className="h-10 w-10 shrink-0 rounded-md" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{track.name}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
                    </div>
                    <span className="text-xs text-gray-500 hidden group-hover:block mr-2">
                      {formatMs(track.duration_ms)}
                    </span>
                    <button
                      onClick={() => toggleLike(track.id)}
                      className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 ${likedIds.has(track.id) ? "text-[#1DB954] opacity-100" : "text-gray-500 hover:text-white"}`}
                    >
                      <Heart className={`h-4 w-4 ${likedIds.has(track.id) ? "fill-current" : ""}`} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Bottom Spotify-style player bar */}
      {currentTrack && (
        <div className="shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-xl px-4 py-3">
          {/* Seek bar */}
          <div className="flex items-center gap-2 mb-2 max-w-xl mx-auto">
            <span className="text-xs text-gray-500 w-8 text-right">{formatMs(seekDragging ? seekValue : progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={seekDragging ? seekValue : progress}
              onChange={(e) => { setSeekDragging(true); setSeekValue(Number(e.target.value)); }}
              onMouseUp={(e) => { setSeekDragging(false); seekTo(Number((e.target as HTMLInputElement).value)); }}
              onTouchEnd={(e) => { setSeekDragging(false); seekTo(Number((e.target as HTMLInputElement).value)); }}
              className="flex-1 accent-[#1DB954] h-1 cursor-pointer"
            />
            <span className="text-xs text-gray-500 w-8">{formatMs(duration)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Track info */}
            <div className="flex items-center gap-3 w-56 min-w-0">
              {currentTrack.album?.images?.[0]?.url && (
                <img src={currentTrack.album.images[0].url} alt="Album" className="h-12 w-12 shrink-0 rounded-lg shadow-lg" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{currentTrack.name}</p>
                <p className="text-xs text-gray-400 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
              </div>
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`shrink-0 transition-all hover:scale-110 ${likedIds.has(currentTrack.id) ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}
              >
                <Heart className={`h-4 w-4 ${likedIds.has(currentTrack.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-4">
              <button onClick={toggleShuffle}
                className={`transition-colors ${shuffle ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}
                title={shuffle ? "Aléatoire activé" : "Aléatoire"}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button onClick={skipPrev} className="text-gray-300 hover:text-white hover:scale-110 transition-all">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white hover:scale-105 transition-transform shadow"
              >
                {isPlaying ? <Pause className="h-4 w-4 text-black" /> : <Play className="h-4 w-4 text-black ml-0.5" />}
              </button>
              <button onClick={skipNext} className="text-gray-300 hover:text-white hover:scale-110 transition-all">
                <SkipForward className="h-5 w-5" />
              </button>
              <button onClick={toggleRepeat}
                className={`transition-colors ${repeatMode > 0 ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}
                title={repeatMode === 2 ? "Répéter 1" : repeatMode === 1 ? "Répéter tout" : "Répéter"}
              >
                <RepeatIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Right controls: volume + devices + fullscreen */}
            <div className="flex items-center gap-3 w-56 justify-end">
              {/* Device picker */}
              <div className="relative" ref={devicesRef}>
                <button
                  onClick={handleOpenDevices}
                  className={`p-1.5 rounded transition-colors ${showDevices ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}
                  title="Changer d'appareil"
                >
                  <MonitorSpeaker className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {showDevices && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-3 w-72 rounded-xl border border-white/15 bg-[#282828] shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <MonitorSpeaker className="h-4 w-4 text-[#1DB954]" />
                          Appareils disponibles
                        </p>
                      </div>
                      {loadingDevices ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : devices.length === 0 ? (
                        <div className="p-4 text-sm text-gray-400 text-center">
                          Aucun appareil actif.<br />
                          <span className="text-xs">Ouvrez Spotify sur un appareil.</span>
                        </div>
                      ) : (
                        <div className="py-2">
                          {devices.map((device) => (
                            <button
                              key={device.id}
                              onClick={() => handleTransfer(device.id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10 ${device.is_active ? "text-[#1DB954]" : "text-white"}`}
                            >
                              <DeviceIcon type={device.type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{device.name}</p>
                                <p className="text-xs text-gray-400">{device.type}</p>
                              </div>
                              {device.is_active && <Check className="h-4 w-4 text-[#1DB954] shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Volume */}
              <button onClick={handleMuteToggle} className="text-gray-500 hover:text-white transition-colors">
                <VolumeIcon className="h-4 w-4" />
              </button>
              <input
                type="range" min={0} max={1} step={0.01}
                value={volMuted ? 0 : volume}
                onChange={(e) => { setVolMuted(false); setVolume(parseFloat(e.target.value)); }}
                className="w-20 accent-[#1DB954] cursor-pointer"
              />

              {/* Fullscreen */}
              <button onClick={() => setIsFullScreen(true)} className="text-gray-500 hover:text-white transition-colors">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
