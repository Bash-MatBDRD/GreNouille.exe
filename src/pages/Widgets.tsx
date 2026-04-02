import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid, Clock, Calendar, Cloud, Cpu, Music, TrendingUp, Plus, X,
  Timer, Target, Battery, Wind, Droplets, Eye, CheckSquare, Trash2, Check,
} from "lucide-react";
import { useSpotify } from "../context/SpotifyContext";

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

// ── Clock ────────────────────────────────────────────────────────────────────

function ClockWidget() {
  const time = useClock();
  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <div className="flex items-end gap-1 font-mono">
        <span className="text-5xl font-black text-white tabular-nums leading-none">{h}</span>
        <motion.span className="text-4xl font-black text-gray-500 leading-none mb-0.5" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
        <span className="text-5xl font-black text-white tabular-nums leading-none">{m}</span>
        <span className="text-2xl font-bold text-gray-600 tabular-nums leading-none mb-1 ml-1">{s}</span>
      </div>
      <p className="text-xs text-gray-500 capitalize mt-1">{dateStr}</p>
    </div>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────

function CalendarWidget() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <div className="flex flex-col h-full gap-2">
      <p className="text-xs font-semibold text-gray-300 capitalize text-center">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => (
          <div key={i} className="text-[9px] text-gray-600 text-center font-medium py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`text-[10px] text-center py-1 rounded-md leading-none transition-colors ${
            d === today.getDate() ? "bg-indigo-500 text-white font-bold" : d ? "text-gray-400 hover:bg-white/5" : ""
          }`}>{d ?? ""}</div>
        ))}
      </div>
    </div>
  );
}

// ── Spotify ───────────────────────────────────────────────────────────────────

function SpotifyWidget() {
  const { currentTrack, isPlaying } = useSpotify();

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <Music className="h-8 w-8 text-gray-700" />
        <p className="text-xs text-gray-600">Aucune musique en cours</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {currentTrack.album?.images?.[0]?.url && (
        <div className="relative">
          <img
            src={currentTrack.album.images[0].url}
            alt=""
            className="h-16 w-16 shadow-lg"
            style={{
              borderRadius: "50%",
              animation: isPlaying ? "spin 8s linear infinite" : undefined,
              boxShadow: isPlaying ? "0 0 20px rgba(29,185,84,0.4)" : undefined,
            }}
          />
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#050505]" />
          </div>
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-white truncate max-w-[160px]">{currentTrack.name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[160px]">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
      </div>
      <div className={`flex items-center gap-1.5 text-xs ${isPlaying ? "text-[#1DB954]" : "text-gray-600"}`}>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-[#1DB954] animate-pulse" : "bg-gray-600"}`} />
        {isPlaying ? "En lecture" : "En pause"}
      </div>
    </div>
  );
}

// ── System Stats ──────────────────────────────────────────────────────────────

function StatsWidget() {
  const [load, setLoad] = useState(Math.floor(Math.random() * 30 + 20));
  const [mem, setMem] = useState(Math.floor(Math.random() * 20 + 50));

  useEffect(() => {
    const t = setInterval(() => {
      setLoad(v => Math.max(10, Math.min(95, v + (Math.random() * 10 - 5))));
      setMem(v => Math.max(30, Math.min(90, v + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "CPU", value: Math.round(load), color: load > 70 ? "#f43f5e" : load > 50 ? "#f59e0b" : "#10b981" },
    { label: "RAM", value: Math.round(mem), color: mem > 80 ? "#f43f5e" : mem > 60 ? "#f59e0b" : "#10b981" },
    { label: "Disk", value: 42, color: "#10b981" },
    { label: "Net", value: 15, color: "#22d3ee" },
  ];

  return (
    <div className="flex flex-col h-full gap-3 justify-center">
      {stats.map(s => (
        <div key={s.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 font-mono">{s.label}</span>
            <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: s.color, boxShadow: `0 0 6px ${s.color}60` }}
              animate={{ width: `${s.value}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Quote ─────────────────────────────────────────────────────────────────────

function QuoteWidget() {
  const quotes = [
    { text: "L'excellence est un art qu'on ne maîtrise que par l'entraînement.", author: "Aristote" },
    { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
    { text: "Le code, c'est de la poésie pour les machines.", author: "Anonyme" },
    { text: "Les données sont le nouveau pétrole.", author: "Clive Humby" },
    { text: "Toute technologie suffisamment avancée est indiscernable de la magie.", author: "A. C. Clarke" },
    { text: "La meilleure façon de prédire l'avenir est de le créer.", author: "Peter Drucker" },
    { text: "Fais-le simplement, fais-le bien.", author: "Anonyme" },
  ];
  const [idx] = useState(() => Math.floor(Math.random() * quotes.length));
  const q = quotes[idx];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-2">
      <div className="text-3xl text-gray-700 font-serif leading-none">"</div>
      <p className="text-xs text-gray-300 italic leading-relaxed">{q.text}</p>
      <p className="text-[10px] text-gray-600">— {q.author}</p>
    </div>
  );
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────

const POMODORO_KEY = "nexus-pomodoro";

function PomodoroWidget() {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;
  const [mode, setMode] = useState<"work" | "break">("work");
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem(POMODORO_KEY) || "0"); } catch { return 0; }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "work") {
              const next = sessions + 1;
              setSessions(next);
              localStorage.setItem(POMODORO_KEY, String(next));
              setMode("break");
              setSeconds(BREAK);
            } else {
              setMode("work");
              setSeconds(WORK);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, sessions]);

  const reset = () => {
    setRunning(false);
    setMode("work");
    setSeconds(WORK);
  };

  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  const total = mode === "work" ? WORK : BREAK;
  const pct = ((total - seconds) / total) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${mode === "work" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
          {mode === "work" ? "Travail" : "Pause"}
        </span>
        <span className="text-[10px] text-gray-600">{sessions} session{sessions !== 1 ? "s" : ""}</span>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80" className="absolute inset-0 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <motion.circle
            cx="40" cy="40" r="34" fill="none"
            stroke={mode === "work" ? "#f43f5e" : "#10b981"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <span className="font-mono text-xl font-black text-white tabular-nums">{m}:{s}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${running
            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
            : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
          }`}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white transition-all">
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Objectives mini checklist ─────────────────────────────────────────────────

const OBJECTIVES_KEY = "nexus-widget-objectives";

function ObjectivesWidget() {
  const [items, setItems] = useState<{ id: number; text: string; done: boolean }[]>(() => {
    try { return JSON.parse(localStorage.getItem(OBJECTIVES_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const save = (next: typeof items) => {
    setItems(next);
    localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(next));
  };

  const toggle = (id: number) => save(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: number) => save(items.filter(i => i.id !== id));
  const add = () => {
    if (!input.trim()) return;
    save([...items, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
    setAdding(false);
  };

  const done = items.filter(i => i.done).length;

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-600">{done}/{items.length} complétés</span>
        <button onClick={() => setAdding(a => !a)} className="text-gray-600 hover:text-white transition-colors">
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {adding && (
        <div className="flex gap-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Nouvel objectif..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/50"
            autoFocus
          />
          <button onClick={add} className="px-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {items.length === 0 ? (
          <p className="text-xs text-gray-700 text-center pt-4">Aucun objectif — ajoutez-en un !</p>
        ) : items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button onClick={() => toggle(item.id)} className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-all ${item.done ? "bg-emerald-500/30 border-emerald-500/50" : "border-white/15 hover:border-white/30"}`}>
              {item.done && <Check className="h-2.5 w-2.5 text-emerald-400" />}
            </button>
            <span className={`flex-1 text-xs truncate ${item.done ? "text-gray-600 line-through" : "text-gray-300"}`}>{item.text}</span>
            <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Battery ───────────────────────────────────────────────────────────────────

function BatteryWidget() {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.getBattery) { setSupported(false); return; }
    nav.getBattery().then((battery: any) => {
      setLevel(Math.round(battery.level * 100));
      setCharging(battery.charging);
      battery.addEventListener("levelchange", () => setLevel(Math.round(battery.level * 100)));
      battery.addEventListener("chargingchange", () => setCharging(battery.charging));
    }).catch(() => setSupported(false));
  }, []);

  const color = level === null ? "#6b7280"
    : level > 60 ? "#10b981"
    : level > 25 ? "#f59e0b"
    : "#f43f5e";

  if (!supported) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <Battery className="h-8 w-8 text-gray-700" />
        <p className="text-xs text-gray-600">Non supporté sur ce navigateur</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="90" height="90" className="-rotate-90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="45" cy="45" r="38" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 38}`}
            strokeDashoffset={`${2 * Math.PI * 38 * (1 - (level ?? 0) / 100)}`}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 38 * (1 - (level ?? 0) / 100)}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-white">{level ?? "--"}<span className="text-base">%</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${charging ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
        <span style={{ color }}>{charging ? "En charge" : level !== null && level < 20 ? "Faible" : "Sur batterie"}</span>
      </div>
    </div>
  );
}

// ── Météo ─────────────────────────────────────────────────────────────────────

function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const [meteo, geo] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&wind_speed_unit=kmh`).then(r => r.json()),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then(r => r.json()),
          ]);
          setWeather(meteo.current);
          setCity(geo.address?.city || geo.address?.town || geo.address?.village || "Votre ville");
        } catch { /* silent */ } finally { setLoading(false); }
      },
      () => setLoading(false)
    );
  }, []);

  const icon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 49) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  };

  if (loading) return <p className="text-sm text-gray-500 text-center">Chargement...</p>;
  if (!weather) return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
      <Cloud className="h-8 w-8 text-gray-700" />
      <p className="text-xs text-gray-600">Activez la géolocalisation</p>
    </div>
  );

  return (
    <div className="flex flex-col justify-center h-full gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black text-white">{Math.round(weather.temperature_2m)}°C</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{city}</p>
        </div>
        <span className="text-4xl">{icon(weather.weathercode)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
          <Wind className="h-3 w-3 text-cyan-400" />
          <span className="text-[10px] text-gray-400">{Math.round(weather.windspeed_10m)} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5">
          <Droplets className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] text-gray-400">{weather.relative_humidity_2m}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────

const COUNTDOWN_KEY = "nexus-widget-countdown";

function CountdownWidget() {
  const [target, setTarget] = useState<string>(() => localStorage.getItem(COUNTDOWN_KEY) || "");
  const [editing, setEditing] = useState(!localStorage.getItem(COUNTDOWN_KEY));
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0, past: false });

  useEffect(() => {
    if (!target) return;
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setRemaining({ d: 0, h: 0, m: 0, s: 0, past: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ d, h, m, s, past: false });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);

  if (editing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Target className="h-6 w-6 text-violet-400" />
        <p className="text-xs text-gray-400">Choisissez une date cible</p>
        <input
          type="datetime-local"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500/50"
          onChange={e => {
            setTarget(e.target.value);
            localStorage.setItem(COUNTDOWN_KEY, e.target.value);
          }}
        />
        {target && (
          <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors">
            Confirmer
          </button>
        )}
      </div>
    );
  }

  if (remaining.past) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <span className="text-2xl">🎉</span>
        <p className="text-sm font-bold text-violet-300">Terminé !</p>
        <button onClick={() => { setTarget(""); setEditing(true); localStorage.removeItem(COUNTDOWN_KEY); }} className="text-xs text-gray-600 hover:text-gray-400">Réinitialiser</button>
      </div>
    );
  }

  const label = new Date(target).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-[10px] text-gray-500 truncate max-w-full px-2">→ {label}</p>
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {[
          { v: remaining.d, l: "j" },
          { v: remaining.h, l: "h" },
          { v: remaining.m, l: "m" },
          { v: remaining.s, l: "s" },
        ].map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center rounded-lg bg-white/5 py-1.5">
            <span className="font-mono text-lg font-black text-white tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
            <span className="text-[9px] text-gray-600 mt-0.5">{l}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setEditing(true)} className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors">Modifier</button>
    </div>
  );
}

// ── Widget registry ───────────────────────────────────────────────────────────

const WIDGETS_CONFIG = [
  { id: "clock",      label: "Horloge",     icon: Clock,       component: ClockWidget,      cols: 2, rows: 1, color: "indigo"  },
  { id: "calendar",   label: "Calendrier",  icon: Calendar,    component: CalendarWidget,   cols: 1, rows: 2, color: "violet"  },
  { id: "spotify",    label: "Spotify",     icon: Music,       component: SpotifyWidget,    cols: 1, rows: 2, color: "emerald" },
  { id: "stats",      label: "Système",     icon: Cpu,         component: StatsWidget,      cols: 1, rows: 2, color: "cyan"    },
  { id: "quote",      label: "Citation",    icon: TrendingUp,  component: QuoteWidget,      cols: 2, rows: 1, color: "amber"   },
  { id: "pomodoro",   label: "Pomodoro",    icon: Timer,       component: PomodoroWidget,   cols: 1, rows: 2, color: "rose"    },
  { id: "objectives", label: "Objectifs",   icon: CheckSquare, component: ObjectivesWidget, cols: 2, rows: 2, color: "lime"    },
  { id: "battery",    label: "Batterie",    icon: Battery,     component: BatteryWidget,    cols: 1, rows: 2, color: "green"   },
  { id: "weather",    label: "Météo",       icon: Cloud,       component: WeatherWidget,    cols: 1, rows: 2, color: "sky"     },
  { id: "countdown",  label: "Compte à rebours", icon: Target, component: CountdownWidget, cols: 1, rows: 2, color: "purple"  },
];

const ACCENT_COLORS: Record<string, string> = {
  indigo:  "rgba(79,110,247,0.12)",
  violet:  "rgba(139,92,246,0.12)",
  emerald: "rgba(16,185,129,0.10)",
  cyan:    "rgba(34,211,238,0.10)",
  amber:   "rgba(245,158,11,0.10)",
  rose:    "rgba(244,63,94,0.10)",
  lime:    "rgba(132,204,22,0.10)",
  green:   "rgba(34,197,94,0.10)",
  sky:     "rgba(14,165,233,0.10)",
  purple:  "rgba(168,85,247,0.10)",
};

const BORDER_COLORS: Record<string, string> = {
  indigo:  "rgba(79,110,247,0.28)",
  violet:  "rgba(139,92,246,0.28)",
  emerald: "rgba(16,185,129,0.28)",
  cyan:    "rgba(34,211,238,0.28)",
  amber:   "rgba(245,158,11,0.28)",
  rose:    "rgba(244,63,94,0.28)",
  lime:    "rgba(132,204,22,0.28)",
  green:   "rgba(34,197,94,0.28)",
  sky:     "rgba(14,165,233,0.28)",
  purple:  "rgba(168,85,247,0.28)",
};

const ICON_COLORS: Record<string, string> = {
  indigo:  "rgba(79,110,247,0.8)",
  violet:  "rgba(139,92,246,0.8)",
  emerald: "rgba(16,185,129,0.8)",
  cyan:    "rgba(34,211,238,0.8)",
  amber:   "rgba(245,158,11,0.8)",
  rose:    "rgba(244,63,94,0.8)",
  lime:    "rgba(132,204,22,0.8)",
  green:   "rgba(34,197,94,0.8)",
  sky:     "rgba(14,165,233,0.8)",
  purple:  "rgba(168,85,247,0.8)",
};

const WIDGETS_VISIBLE_KEY = "nexus-widgets-visible";

export default function Widgets() {
  const [visible, setVisible] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WIDGETS_VISIBLE_KEY) || "null") || ["clock", "calendar", "spotify", "stats", "quote"]; }
    catch { return ["clock", "calendar", "spotify", "stats", "quote"]; }
  });

  const toggleWidget = (id: string) => {
    const next = visible.includes(id) ? visible.filter(v => v !== id) : [...visible, id];
    setVisible(next);
    localStorage.setItem(WIDGETS_VISIBLE_KEY, JSON.stringify(next));
  };

  const activeWidgets = WIDGETS_CONFIG.filter(w => visible.includes(w.id));

  return (
    <div className="flex-1 p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <LayoutGrid className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-sky-500">
                Widgets
              </span>
            </h1>
            <p className="mt-2 text-gray-400">Affichez vos informations importantes en un coup d'œil.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {WIDGETS_CONFIG.map(w => {
              const isActive = visible.includes(w.id);
              return (
                <button
                  key={w.id}
                  onClick={() => toggleWidget(w.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    isActive
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/8 text-gray-600 hover:border-white/15 hover:text-gray-400"
                  }`}
                >
                  <w.icon className="h-3 w-3" />
                  {w.label}
                  {isActive
                    ? <X className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                    : <Plus className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                  }
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {activeWidgets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4">
          <LayoutGrid className="h-16 w-16 text-gray-800" />
          <p className="text-gray-600 text-sm">Aucun widget actif. Activez-en un ci-dessus.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]"
        >
          <AnimatePresence>
            {activeWidgets.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -8 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
                className="rounded-2xl border p-4 backdrop-blur-xl overflow-hidden relative group"
                style={{
                  background: ACCENT_COLORS[w.color] || "rgba(255,255,255,0.03)",
                  borderColor: BORDER_COLORS[w.color] || "rgba(255,255,255,0.1)",
                  gridColumn: w.cols > 1 ? `span ${w.cols}` : undefined,
                  gridRow:    w.rows > 1 ? `span ${w.rows}` : undefined,
                }}
              >
                {/* Subtle glow in corner */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-30"
                  style={{ background: BORDER_COLORS[w.color]?.replace("0.28", "1") || "white", filter: "blur(24px)" }}
                />

                <div className="flex items-center gap-1.5 mb-3 relative z-10">
                  <w.icon className="h-3.5 w-3.5" style={{ color: ICON_COLORS[w.color] }} />
                  <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: ICON_COLORS[w.color]?.replace("0.8", "0.6") }}>
                    {w.label}
                  </span>
                </div>

                <div className="flex-1 h-[calc(100%-28px)] relative z-10">
                  <w.component />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
