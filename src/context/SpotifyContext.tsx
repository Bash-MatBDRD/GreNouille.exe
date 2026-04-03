import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export type SpotifyDevice = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
};

type SpotifyContextType = {
  player: any;
  deviceId: string | null;
  currentTrack: any;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeatMode: number;
  needsReauth: boolean;
  progress: number;
  duration: number;
  devices: SpotifyDevice[];
  likedIds: Set<string>;
  setVolume: (v: number) => Promise<void>;
  playTrack: (uri?: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrev: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => Promise<void>;
  disconnectSpotify: () => Promise<void>;
  reconnect: () => void;
  transferPlayback: (deviceId: string) => Promise<void>;
  fetchDevices: () => Promise<void>;
  toggleLike: (trackId: string) => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
};

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const sdkActiveRef = useRef(false);
  const progressIntervalRef = useRef<any>(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);

  const startProgressTick = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (isPlayingRef.current) {
        progressRef.current += 1000;
        setProgress(progressRef.current);
      }
    }, 1000);
  }, []);

  const stopProgressTick = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const checkLiked = useCallback(async (trackId: string) => {
    try {
      const r = await axios.get(`/api/spotify/player/saved?ids=${trackId}`);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (r.data[0]) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
    } catch {}
  }, []);

  const initPlayer = useCallback(async () => {
    if (playerRef.current) return;
    try {
      const res = await axios.get("/api/spotify/token");
      const token = res.data.token;
      if (!token) return;

      const spotifyPlayer = new window.Spotify.Player({
        name: "Nexus Dashboard Player",
        getOAuthToken: async (cb: (t: string) => void) => {
          try {
            const fresh = await axios.get("/api/spotify/token");
            cb(fresh.data.token || token);
          } catch {
            cb(token);
          }
        },
        volume: 0.5,
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        deviceIdRef.current = device_id;
        setDeviceId(device_id);
        sdkActiveRef.current = true;
      });

      spotifyPlayer.addListener("not_ready", () => {
        deviceIdRef.current = null;
        setDeviceId(null);
        sdkActiveRef.current = false;
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        const track = state.track_window.current_track;
        setCurrentTrack(track);
        setIsPlaying(!state.paused);
        isPlayingRef.current = !state.paused;
        setShuffle(state.shuffle);
        setRepeatMode(state.repeat_mode);
        progressRef.current = state.position;
        setProgress(state.position);
        setDuration(state.duration);
        if (!state.paused) startProgressTick();
        else stopProgressTick();
        if (track?.id) checkLiked(track.id);
      });

      spotifyPlayer.addListener("authentication_error", async () => {
        try {
          await axios.get("/api/spotify/token");
          playerRef.current?.disconnect();
          playerRef.current = null;
          initializedRef.current = false;
          sdkActiveRef.current = false;
        } catch {
          setNeedsReauth(true);
        }
      });

      spotifyPlayer.addListener("initialization_error", (e: any) => {
        console.error("[Spotify SDK] Init error:", e.message);
      });

      spotifyPlayer.addListener("playback_error", (e: any) => {
        console.error("[Spotify SDK] Playback error:", e.message);
      });

      await spotifyPlayer.connect();
    } catch (err) {
      console.error("[Spotify] Failed to initialize player:", err);
    }
  }, [checkLiked, startProgressTick, stopProgressTick]);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth || initializedRef.current) return;
    initializedRef.current = true;

    if (window.Spotify) {
      initPlayer();
      return;
    }

    if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = initPlayer;
  }, [user?.hasSpotify, needsReauth, initPlayer]);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;

    const fetchCurrent = async () => {
      if (sdkActiveRef.current) return;
      try {
        const res = await axios.get("/api/spotify/player/current");
        if (res.data?.item) {
          const track = res.data.item;
          setCurrentTrack(track);
          setIsPlaying(res.data.is_playing);
          isPlayingRef.current = res.data.is_playing;
          setShuffle(res.data.shuffle_state ?? false);
          setRepeatMode(
            res.data.repeat_state === "track" ? 2
            : res.data.repeat_state === "context" ? 1 : 0
          );
          progressRef.current = res.data.progress_ms ?? 0;
          setProgress(res.data.progress_ms ?? 0);
          setDuration(track.duration_ms ?? 0);
          setNeedsReauth(false);
          if (track?.id) checkLiked(track.id);
          if (res.data.is_playing) startProgressTick();
          else stopProgressTick();
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setNeedsReauth(true);
        }
      }
    };

    fetchCurrent();
    const interval = setInterval(fetchCurrent, 8000);
    return () => clearInterval(interval);
  }, [user?.hasSpotify, needsReauth, checkLiked, startProgressTick, stopProgressTick]);

  useEffect(() => {
    return () => stopProgressTick();
  }, [stopProgressTick]);

  const fetchDevices = useCallback(async () => {
    try {
      const r = await axios.get("/api/spotify/player/devices");
      setDevices(r.data || []);
    } catch {}
  }, []);

  const setVolume = async (v: number) => {
    setVolumeState(v);
    if (playerRef.current) {
      await playerRef.current.setVolume(v).catch(() => {});
    } else {
      await axios.put(`/api/spotify/player/volume?volume_percent=${Math.round(v * 100)}`).catch(() => {});
    }
  };

  const playTrack = async (uri?: string) => {
    const dId = deviceIdRef.current;
    await axios.put("/api/spotify/player/play", {
      uris: uri ? [uri] : undefined,
      device_id: dId || undefined,
    });
    setIsPlaying(true);
    isPlayingRef.current = true;
    startProgressTick();
    if (playerRef.current) {
      setTimeout(async () => {
        const state = await playerRef.current?.getCurrentState();
        if (state) {
          const track = state.track_window.current_track;
          setCurrentTrack(track);
          setIsPlaying(!state.paused);
          isPlayingRef.current = !state.paused;
          progressRef.current = state.position;
          setProgress(state.position);
          setDuration(state.duration);
          if (track?.id) checkLiked(track.id);
        }
      }, 800);
    }
  };

  const pauseTrack = async () => {
    if (playerRef.current) {
      await playerRef.current.pause().catch(() => {});
    } else {
      await axios.put("/api/spotify/player/pause");
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopProgressTick();
  };

  const skipNext = async () => {
    if (playerRef.current) {
      await playerRef.current.nextTrack().catch(() => {});
    } else {
      await axios.post("/api/spotify/player/next");
    }
  };

  const skipPrev = async () => {
    if (playerRef.current) {
      await playerRef.current.previousTrack().catch(() => {});
    } else {
      await axios.post("/api/spotify/player/previous");
    }
  };

  const toggleShuffle = async () => {
    const next = !shuffle;
    await axios.put(`/api/spotify/player/shuffle?state=${next}`);
    setShuffle(next);
  };

  const toggleRepeat = async () => {
    const modes = ["off", "context", "track"];
    const next = (repeatMode + 1) % 3;
    await axios.put(`/api/spotify/player/repeat?state=${modes[next]}`);
    setRepeatMode(next);
  };

  const seekTo = async (positionMs: number) => {
    progressRef.current = positionMs;
    setProgress(positionMs);
    if (playerRef.current) {
      await playerRef.current.seek(positionMs).catch(() => {});
    } else {
      await axios.post("/api/spotify/player/seek", { position_ms: positionMs }).catch(() => {});
    }
  };

  const transferPlayback = async (targetDeviceId: string) => {
    await axios.put("/api/spotify/player/transfer", { device_id: targetDeviceId, play: isPlaying });
    setDevices((prev) =>
      prev.map((d) => ({ ...d, is_active: d.id === targetDeviceId }))
    );
  };

  const toggleLike = async (trackId: string) => {
    const isLiked = likedIds.has(trackId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
    try {
      if (isLiked) {
        await axios.delete("/api/spotify/player/save", { data: { ids: [trackId] } });
      } else {
        await axios.put("/api/spotify/player/save", { ids: [trackId] });
      }
    } catch {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
    }
  };

  const disconnectSpotify = async () => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
    stopProgressTick();
    sdkActiveRef.current = false;
    deviceIdRef.current = null;
    setPlayer(null);
    setDeviceId(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setProgress(0);
    setDuration(0);
    setDevices([]);
    setLikedIds(new Set());
    initializedRef.current = false;
    await axios.post("/api/spotify/disconnect").catch(() => {});
  };

  const reconnect = () => {
    if (playerRef.current) {
      try { playerRef.current.disconnect(); } catch {}
      playerRef.current = null;
    }
    setPlayer(null);
    setDeviceId(null);
    deviceIdRef.current = null;
    sdkActiveRef.current = false;
    initializedRef.current = false;
    setNeedsReauth(false);
  };

  return (
    <SpotifyContext.Provider
      value={{
        player, deviceId, currentTrack, isPlaying, volume, shuffle, repeatMode, needsReauth,
        progress, duration, devices, likedIds,
        setVolume, playTrack, pauseTrack, skipNext, skipPrev,
        toggleShuffle, toggleRepeat, disconnectSpotify, reconnect,
        transferPlayback, fetchDevices, toggleLike, seekTo,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within SpotifyProvider");
  return ctx;
}
