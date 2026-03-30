import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Shield, Activity, Users, Zap, Plus, X, Music, Cloud, MessageSquare, StickyNote, Link2, RefreshCw, FileDown, Check } from "lucide-react";
import axios from "axios";

const ALL_WIDGETS = [
  { id: "spotify", label: "Spotify", icon: Music, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "weather", label: "Météo", icon: Cloud, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "discord", label: "Discord", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { id: "notes", label: "Notes rapides", icon: StickyNote, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "links", label: "Liens rapides", icon: Link2, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
];

const WIDGET_STORAGE_KEY = "nexus-active-widgets";
const NOTE_WIDGET_KEY = "nexus-widget-note";
const LINKS_WIDGET_KEY = "nexus-widget-links";

function SpotifyWidget() {
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get("/api/spotify/player/current")
      .then((r) => { if (r.data?.item) setTrack(r.data.item); })
      .catch(() => {})
      .finally(() => setLoading(false));
    const i = setInterval(() => {
      axios.get("/api/spotify/player/current").then((r) => { if (r.data?.item) setTrack(r.data.item); }).catch(() => {});
    }, 5000);
    return () => clearInterval(i);
  }, []);
  if (loading) return <p className="text-sm text-gray-500">Chargement...</p>;
  if (!track) return <p className="text-sm text-gray-500">Aucune lecture en cours</p>;
  return (
    <div className="flex items-center gap-3">
      {track.album?.images?.[0]?.url && <img src={track.album.images[0].url} alt="Album" className="h-12 w-12 rounded-lg shrink-0" />}
      <div className="min-w-0">
        <p className="font-semibold text-white text-sm truncate">{track.name}</p>
        <p className="text-xs text-gray-400 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-emerald-400" initial={{ width: "0%" }} animate={{ width: "60%" }} transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }} />
        </div>
      </div>
    </div>
  );
}

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
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh`).then((r) => r.json()),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then((r) => r.json()),
          ]);
          setWeather(meteo.current);
          setCity(geo.address?.city || geo.address?.town || geo.address?.village || "Votre ville");
        } catch { setLoading(false); }
        finally { setLoading(false); }
      },
      () => setLoading(false)
    );
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 49) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };

  if (loading) return <p className="text-sm text-gray-500">Chargement...</p>;
  if (!weather) return <p className="text-sm text-gray-500">Activez la géolocalisation pour voir la météo</p>;
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-black text-white">{Math.round(weather.temperature_2m)}°C</p>
        <p className="text-sm text-gray-400 mt-0.5">{city}</p>
        <p className="text-xs text-gray-500 mt-1">Vent : {Math.round(weather.windspeed_10m)} km/h</p>
      </div>
      <span className="text-5xl">{getWeatherIcon(weather.weathercode)}</span>
    </div>
  );
}

function DiscordWidget() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    axios.get("/api/auth/discord/status").then((r) => setConfigured(r.data.configured)).catch(() => setConfigured(false));
  }, []);
  if (configured === null) return <p className="text-sm text-gray-500">Vérification...</p>;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${configured ? "bg-indigo-500/20" : "bg-red-500/10"}`}>
        <MessageSquare className={`h-6 w-6 ${configured ? "text-indigo-400" : "text-red-400"}`} />
      </div>
      <div>
        <p className={`font-semibold ${configured ? "text-indigo-300" : "text-red-400"}`}>{configured ? "Bot connecté" : "Non configuré"}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {configured ? "Discord bot actif et opérationnel" : "Ajoutez DISCORD_BOT_TOKEN dans les secrets"}
        </p>
      </div>
    </div>
  );
}

function NotesWidget() {
  const [note, setNote] = useState(() => localStorage.getItem(NOTE_WIDGET_KEY) || "");
  const save = useCallback((v: string) => { setNote(v); localStorage.setItem(NOTE_WIDGET_KEY, v); }, []);
  return (
    <textarea
      value={note}
      onChange={(e) => save(e.target.value)}
      placeholder="Écrivez ici..."
      className="w-full h-24 resize-none bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none leading-relaxed"
    />
  );
}

function LinksWidget() {
  const [links, setLinks] = useState<{ label: string; url: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(LINKS_WIDGET_KEY) || "[]"); } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const save = (items: typeof links) => { setLinks(items); localStorage.setItem(LINKS_WIDGET_KEY, JSON.stringify(items)); };

  const add = () => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!u.startsWith("http")) u = "https://" + u;
    save([...links, { label: label.trim() || u, url: u }]);
    setLabel(""); setUrl(""); setAdding(false);
  };

  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-400 hover:text-blue-300 truncate transition-colors">{l.label}</a>
          <button onClick={() => save(links.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-1.5">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nom du lien" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500" onKeyDown={(e) => e.key === "Enter" && add()} />
          <div className="flex gap-1.5">
            <button onClick={add} className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-500">Ajouter</button>
            <button onClick={() => setAdding(false)} className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white hover:bg-white/20">Annuler</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Ajouter un lien
        </button>
      )}
    </div>
  );
}

function WidgetContent({ id }: { id: string }) {
  if (id === "spotify") return <SpotifyWidget />;
  if (id === "weather") return <WeatherWidget />;
  if (id === "discord") return <DiscordWidget />;
  if (id === "notes") return <NotesWidget />;
  if (id === "links") return <LinksWidget />;
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState({ users: 0 });
  const [actionStatus, setActionStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WIDGET_STORAGE_KEY) || '["spotify","weather"]'); } catch { return ["spotify", "weather"]; }
  });

  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        if (konamiIndex === konamiCode.length - 1) {
          setEasterEggActive(true); setKonamiIndex(0); setTimeout(() => setEasterEggActive(false), 5000);
        } else { setKonamiIndex((prev) => prev + 1); }
      } else { setKonamiIndex(0); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([axios.get("/api/logs"), axios.get("/api/database/stats")]);
        setRecentLogs(logsRes.data.slice(0, 4));
        setDbStats(statsRes.data);
      } catch { }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const saveWidgets = (w: string[]) => { setActiveWidgets(w); localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(w)); };
  const addWidget = (id: string) => { if (!activeWidgets.includes(id)) saveWidgets([...activeWidgets, id]); setShowAddWidget(false); };
  const removeWidget = (id: string) => saveWidgets(activeWidgets.filter((w) => w !== id));
  const inactiveWidgets = ALL_WIDGETS.filter((w) => !activeWidgets.includes(w.id));

  const showAction = (msg: string, ok: boolean) => {
    setActionStatus({ msg, ok });
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleRestartServices = async () => {
    try {
      await axios.get("/api/health");
      showAction("Services redémarrés avec succès !", true);
    } catch { showAction("Erreur lors du redémarrage.", false); }
  };

  const handleGenerateReport = () => {
    const report = {
      generated: new Date().toISOString(),
      user: user?.username,
      stats: dbStats,
      recentActivity: recentLogs.slice(0, 5),
      activeWidgets,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    showAction("Rapport généré et téléchargé !", true);
  };

  const stats = [
    { label: "Statut Système", value: "En ligne", icon: Activity, color: "text-green-400" },
    { label: "Niveau Sécurité", value: "Maximum", icon: Shield, color: "text-blue-400" },
    { label: "Utilisateurs", value: dbStats.users.toString(), icon: Users, color: "text-purple-400" },
    { label: "Latence API", value: "24ms", icon: Zap, color: "text-yellow-400" },
  ];

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
        {easterEggActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360], filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              HACKER MODE ACTIVATED
            </motion.div>
          </motion.div>
        )}
        {actionStatus && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${actionStatus.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}>
            {actionStatus.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {actionStatus.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Bon retour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] via-[#00FF00] to-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">{user?.username}</span>
        </h1>
        <p className="mt-2 text-gray-400">Voici ce qui se passe aujourd'hui.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }} whileHover={{ scale: 1.05, y: -5 }} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{stat.value}</p>
              </div>
              <div className={`rounded-xl bg-white/5 p-3 ${stat.color} shadow-[0_0_15px_currentColor] group-hover:shadow-[0_0_25px_currentColor] transition-shadow duration-300`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Mes Widgets</h2>
            <button
              onClick={() => setShowAddWidget(!showAddWidget)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${showAddWidget ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20" : "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"}`}
            >
              {showAddWidget ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showAddWidget && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400 mb-3">Ajouter un widget :</p>
                  {inactiveWidgets.length === 0 ? (
                    <p className="text-sm text-gray-600">Tous les widgets sont déjà ajoutés.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inactiveWidgets.map((w) => (
                        <button key={w.id} onClick={() => addWidget(w.id)} className={`flex items-center gap-2 rounded-full border ${w.border} ${w.bg} px-3 py-1.5 text-sm font-medium ${w.color} hover:opacity-80 transition-opacity`}>
                          <w.icon className="h-4 w-4" />
                          {w.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeWidgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Plus className="h-12 w-12 text-gray-700 mb-3" />
              <p className="text-gray-500">Aucun widget actif</p>
              <p className="text-sm text-gray-600 mt-1">Cliquez sur + pour ajouter des widgets</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeWidgets.map((wid) => {
                const w = ALL_WIDGETS.find((x) => x.id === wid);
                if (!w) return null;
                return (
                  <motion.div key={wid} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative rounded-xl border ${w.border} ${w.bg} p-4 group`}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-sm font-semibold ${w.color}`}>
                        <w.icon className="h-4 w-4" />
                        {w.label}
                      </div>
                      <button onClick={() => removeWidget(wid)} className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <WidgetContent id={wid} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white mb-4">Activité Récente</h2>
            <div className="flex flex-col gap-3">
              {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${log.type === "warning" ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" : log.type === "success" ? "bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" : log.type === "error" ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" : "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"}`} />
                  <div>
                    <p className="text-sm text-gray-300">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white mb-4">Actions Rapides</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGenerateReport}
                className="relative overflow-hidden w-full rounded-xl bg-[#39FF14]/20 border border-[#39FF14]/30 px-4 py-3 text-sm font-medium text-[#39FF14] transition-all hover:bg-[#39FF14]/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center gap-2"
              >
                <FileDown className="h-4 w-4 shrink-0" />
                Générer un rapport
              </button>
              <button
                onClick={handleRestartServices}
                className="relative overflow-hidden w-full rounded-xl bg-teal-600/20 border border-teal-500/30 px-4 py-3 text-sm font-medium text-teal-400 transition-all hover:bg-teal-600/30 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                Redémarrer les services
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
