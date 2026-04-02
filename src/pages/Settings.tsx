import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings as SettingsIcon, Bell, Lock, Palette, Trash2, Check, Sparkles, Eye, ChevronDown, ChevronUp, X } from "lucide-react";
import { type SplashTheme, SPLASH_KEY, SPLASH_ENABLED_KEY, renderSplash } from "../components/Splashscreen";

const SETTINGS_KEY = "nexus-settings";

interface NexusSettings {
  animations: boolean;
  pushNotifications: boolean;
  emailAlerts: boolean;
  sessionTimeout: string;
  compactMode: boolean;
  showAvatarInSidebar: boolean;
  autoSave: boolean;
}

const DEFAULT_SETTINGS: NexusSettings = {
  animations: true,
  pushNotifications: false,
  emailAlerts: false,
  sessionTimeout: "1h",
  compactMode: false,
  showAvatarInSidebar: true,
  autoSave: true,
};

function loadSettings(): NexusSettings {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
  catch { return DEFAULT_SETTINGS; }
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${value ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-gray-700"}`}
    >
      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

const SPLASH_OPTIONS: { id: SplashTheme; label: string; description: string; preview: React.ReactNode }[] = [
  {
    id: "nexus",
    label: "Nexus",
    description: "Logo animé avec lueurs",
    preview: (
      <div className="w-full h-full bg-[#05050f] flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg, rgba(79,110,247,0.4), rgba(124,58,237,0.3))", boxShadow: "0 0 12px rgba(79,110,247,0.5)" }}>
            <span className="text-white font-black text-sm">N</span>
          </div>
          <span className="text-white text-[8px] font-black tracking-widest">NEXUS</span>
          <div className="w-10 h-0.5 rounded-full overflow-hidden bg-white/10">
            <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: "linear-gradient(90deg, transparent, #4F6EF7, transparent)" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ios",
    label: "iOS",
    description: "Style démarrage iPhone",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(145deg, #1a1a2e, #0f3460)", boxShadow: "0 0 10px rgba(79,110,247,0.3)" }}>
            <span className="text-white font-black text-base">N</span>
          </div>
          <span className="text-white text-[9px] font-medium">Nexus Panel</span>
          <div className="flex gap-0.5">
            {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/60" />)}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "windows",
    label: "Windows",
    description: "Style Windows 11",
    preview: (
      <div className="w-full h-full bg-[#050510] flex flex-col items-center justify-between py-3 rounded-xl">
        <div />
        <div className="flex flex-col items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            {["#4F6EF7","#7C3AED","#6366F1","#8B5CF6"].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
          </div>
          <span className="text-white text-[8px] tracking-widest font-light">NEXUS</span>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />)}
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Texte épuré, lettre par lettre",
    preview: (
      <div className="w-full h-full bg-[#030303] flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-1">
          <span className="text-white text-xs font-thin tracking-[0.4em]">NEXUS</span>
          <div className="w-8 h-px bg-white/30" />
          <span className="text-white/30 text-[7px] tracking-widest">control panel</span>
        </div>
      </div>
    ),
  },
  {
    id: "netflix",
    label: "Netflix",
    description: "Intro rouge cinématique",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(229,9,20,0.2) 0%, transparent 70%)" }} />
        <div className="relative flex items-center justify-center">
          <div className="absolute w-14 h-14 rounded-full" style={{ background: "radial-gradient(circle, rgba(229,9,20,0.5) 0%, transparent 70%)", filter: "blur(8px)" }} />
          <svg width="22" height="30" viewBox="0 0 110 148" fill="none">
            <polygon points="3,0 28,0 55,78 82,0 107,0 107,148 82,148 82,70 55,148 28,70 28,148 3,148" fill="#E50914" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: "matrix",
    label: "Matrix",
    description: "Pluie de code japonais",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 flex gap-1 p-1 opacity-60">
          {Array.from({length: 8}, (_, col) => (
            <div key={col} className="flex flex-col gap-0.5" style={{ flex: 1 }}>
              {Array.from({length: 10}, (_, row) => (
                <div key={row} className="text-[5px] font-mono leading-none"
                  style={{ color: row === 2 ? "#88ffbb" : `rgba(0,${100+row*15},60,${0.8-row*0.07})` }}>
                  {["ア","イ","ウ","ネ","X","0","ス","1"][Math.abs(col-row)%8]}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="relative z-10 text-[10px] font-mono font-bold px-2 py-1 rounded" style={{ color: "#00ff66", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(0,255,102,0.3)", textShadow: "0 0 6px #00ff66" }}>NEXUS</div>
      </div>
    ),
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Glitch néon rose & cyan",
    preview: (
      <div className="w-full h-full bg-[#02000a] flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0">
          {[20,40,60,80].map(pct => (
            <div key={pct} className="absolute left-0 right-0" style={{ top: `${pct}%`, height: 1, background: "rgba(0,240,255,0.08)" }} />
          ))}
        </div>
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-sm font-black font-mono" style={{ color: "#fff", textShadow: "-1px 0 #ff00cc, 1px 0 #00f0ff" }}>N</span>
          <div className="flex items-center gap-1">
            <div className="h-px w-4" style={{ background: "linear-gradient(90deg, transparent, #00f0ff)" }} />
            <span className="text-[7px] font-mono tracking-widest" style={{ color: "#00f0ff" }}>NEXUS</span>
            <div className="h-px w-4" style={{ background: "linear-gradient(90deg, #ff00cc, transparent)" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    description: "Démarrage macOS épuré",
    preview: (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3 rounded-xl">
        <svg width="22" height="22" viewBox="0 0 72 72" fill="none">
          <path d="M18 58 L18 14 L36 42 L54 14 L54 58" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="rounded-full overflow-hidden" style={{ width: 48, height: 2, background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full animate-pulse" style={{ width: "65%", background: "rgba(255,255,255,0.8)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "hud",
    label: "HUD",
    description: "Radar militaire & boot log",
    preview: (
      <div className="w-full h-full bg-[#000d08] flex items-center justify-center gap-3 rounded-xl overflow-hidden">
        <div style={{ width: 36, height: 36 }}>
          <svg width="36" height="36" viewBox="0 0 120 120">
            {[50,37,24].map((r, i) => <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="rgba(0,255,120,0.25)" strokeWidth="1" />)}
            <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />
            <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />
            <line x1="60" y1="60" x2="60" y2="10" stroke="rgba(0,255,120,0.8)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          {["AUTH... [OK]", "NET.... [OK]", "AI..... [OK]"].map((l, i) => (
            <span key={i} className="text-[6px] font-mono" style={{ color: "rgba(0,200,90,0.7)" }}>{l}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Aurores boréales animées",
    preview: (
      <div className="w-full h-full bg-[#02030d] flex items-center justify-center rounded-xl overflow-hidden relative">
        {[
          { c: "rgba(0,200,255,0.25)", l: "20%", t: "30%" },
          { c: "rgba(124,58,237,0.2)", l: "55%", t: "20%" },
          { c: "rgba(16,185,129,0.18)", l: "35%", t: "55%" },
        ].map((o, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 80, height: 60, left: o.l, top: o.t, transform: "translate(-50%,-50%)", background: `radial-gradient(ellipse, ${o.c} 0%, transparent 70%)`, filter: "blur(12px)" }} />
        ))}
        <span className="relative z-10 text-[10px] font-black tracking-widest" style={{ background: "linear-gradient(135deg, #a5f3fc, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</span>
      </div>
    ),
  },
  {
    id: "glitch",
    label: "Glitch",
    description: "Corruption numérique",
    preview: (
      <div className="w-full h-full bg-[#080008] flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="relative select-none">
          <span className="absolute text-base font-black" style={{ color: "#ff003c", left: 2, top: 0, opacity: 0.7 }}>NEXUS</span>
          <span className="absolute text-base font-black" style={{ color: "#00f0ff", left: -2, top: 0, opacity: 0.7 }}>NEXUS</span>
          <span className="text-base font-black" style={{ color: "#ffffff" }}>NEXUS</span>
        </div>
      </div>
    ),
  },
  {
    id: "retro",
    label: "Rétro",
    description: "Terminal DOS old school",
    preview: (
      <div className="w-full h-full bg-[#0a0a0a] flex items-start justify-start p-2 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-0.5 font-mono">
          {["BIOS v2.1.4 OK", "RAM: 16384MB OK", "> NEXUS.SYS..."].map((l, i) => (
            <span key={i} className="text-[6px]" style={{ color: "rgba(0,220,50,0.7)", textShadow: "0 0 4px rgba(0,255,60,0.4)" }}>{l}</span>
          ))}
          <span className="text-[8px] font-bold mt-1" style={{ color: "#00ff3c", textShadow: "0 0 8px rgba(0,255,60,0.6)" }}>NEXUS READY.</span>
        </div>
      </div>
    ),
  },
];

const INITIAL_VISIBLE = 6;

function SplashInner({ theme, visible }: { theme: SplashTheme; visible: boolean }) {
  return renderSplash(theme, { visible }) as React.ReactElement;
}

function SplashPreviewModal({ theme, onClose }: { theme: SplashTheme; onClose: () => void }) {
  const [previewKey, setPreviewKey] = useState(0);

  const replay = () => setPreviewKey(k => k + 1);

  return (
    <div className="fixed inset-0 z-[90]">
      <SplashInner key={previewKey} theme={theme} visible={true} />
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        <button
          onClick={replay}
          className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 text-xs text-white font-medium hover:bg-white/20 transition-all"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Rejouer
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<NexusSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [splashTheme, setSplashTheme] = useState<SplashTheme>(
    () => (localStorage.getItem(SPLASH_KEY) as SplashTheme) || "nexus"
  );
  const [splashEnabled, setSplashEnabled] = useState<boolean>(
    () => localStorage.getItem(SPLASH_ENABLED_KEY) !== "false"
  );
  const [showAll, setShowAll] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<SplashTheme | null>(null);

  const update = (key: keyof NexusSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSplash = (theme: SplashTheme) => {
    setSplashTheme(theme);
    localStorage.setItem(SPLASH_KEY, theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSplashEnabled = (enabled: boolean) => {
    setSplashEnabled(enabled);
    localStorage.setItem(SPLASH_ENABLED_KEY, enabled ? "true" : "false");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearCache = () => {
    const keys = Object.keys(localStorage).filter((k) => !k.startsWith("nexus-"));
    keys.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  const resetSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSettings(DEFAULT_SETTINGS);
  };

  const visibleOptions = showAll ? SPLASH_OPTIONS : SPLASH_OPTIONS.slice(0, INITIAL_VISIBLE);

  return (
    <div className="flex-1 p-6 md:p-8">
      {previewTheme && (
        <SplashPreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} />
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <SettingsIcon className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-500">
                Paramètres
              </span>
            </h1>
            <p className="mt-2 text-gray-400">Configurez votre expérience Nexus Dashboard.</p>
          </div>
          {saved && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-400">
              <Check className="h-4 w-4" /> Sauvegardé
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Animation de démarrage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02, duration: 0.3 }} className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl md:col-span-2">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Sparkles className="h-6 w-6 text-violet-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Animation de démarrage</h2>
          </div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-300 font-medium">Afficher l'animation de démarrage</p>
              <p className="text-sm text-gray-500 mt-0.5">Si désactivée, l'application s'ouvre directement.</p>
            </div>
            <Toggle value={splashEnabled} onChange={updateSplashEnabled} />
          </div>

          <div className={`transition-opacity duration-200 ${!splashEnabled ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <AnimatePresence initial={false}>
                {visibleOptions.map((opt) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      splashTheme === opt.id
                        ? "border-indigo-500 shadow-[0_0_20px_rgba(79,110,247,0.4)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => updateSplash(opt.id)}
                  >
                    <div className="h-24 w-full relative">
                      {opt.preview}
                      {splashTheme === opt.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {/* Eye preview button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewTheme(opt.id); }}
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                        title="Prévisualiser"
                      >
                        <Eye className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                    <div className={`px-2.5 py-2 text-left ${splashTheme === opt.id ? "bg-indigo-500/10" : "bg-white/3"}`}>
                      <p className={`text-xs font-semibold ${splashTheme === opt.id ? "text-indigo-300" : "text-white"}`}>{opt.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Expand / collapse button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-gray-300 hover:bg-white/10 hover:border-white/25 transition-all duration-200"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir plus d'animations ({SPLASH_OPTIONS.length - INITIAL_VISIBLE} autres)
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }} className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Palette className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Apparence</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Animations</span>
                <p className="text-xs text-gray-500 mt-0.5">Activer les transitions animées</p>
              </div>
              <Toggle value={settings.animations} onChange={(v) => update("animations", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Mode compact</span>
                <p className="text-xs text-gray-500 mt-0.5">Réduire l'espacement des éléments</p>
              </div>
              <Toggle value={settings.compactMode} onChange={(v) => update("compactMode", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Avatar dans la barre latérale</span>
                <p className="text-xs text-gray-500 mt-0.5">Afficher votre photo de profil</p>
              </div>
              <Toggle value={settings.showAvatarInSidebar} onChange={(v) => update("showAvatarInSidebar", v)} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }} className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Bell className="h-6 w-6 text-teal-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Notifications push</span>
                <p className="text-xs text-gray-500 mt-0.5">Alertes dans le navigateur</p>
              </div>
              <Toggle value={settings.pushNotifications} onChange={(v) => {
                if (v && "Notification" in window) {
                  Notification.requestPermission().then((perm) => {
                    update("pushNotifications", perm === "granted");
                  });
                } else {
                  update("pushNotifications", v);
                }
              }} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Alertes email</span>
                <p className="text-xs text-gray-500 mt-0.5">Recevoir des notifications par email</p>
              </div>
              <Toggle value={settings.emailAlerts} onChange={(v) => update("emailAlerts", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Sauvegarde automatique</span>
                <p className="text-xs text-gray-500 mt-0.5">Sauvegarder les modifications automatiquement</p>
              </div>
              <Toggle value={settings.autoSave} onChange={(v) => update("autoSave", v)} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }} className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Lock className="h-6 w-6 text-green-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Confidentialité & Sécurité</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Délai d'expiration session</span>
                <p className="text-xs text-gray-500 mt-0.5">Déconnexion automatique après inactivité</p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => update("sessionTimeout", e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white text-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="15m" className="bg-gray-900">15 minutes</option>
                <option value="1h" className="bg-gray-900">1 heure</option>
                <option value="never" className="bg-gray-900">Jamais</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Trash2 className="h-6 w-6 text-red-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Données</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Vider le cache</span>
                <p className="text-xs text-gray-500 mt-0.5">Supprimer les données temporaires du navigateur</p>
              </div>
              <button
                onClick={clearCache}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${cacheCleared ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/10 border-white/10 text-white hover:bg-white/20"}`}
              >
                {cacheCleared ? <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Vidé !</span> : "Vider maintenant"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Réinitialiser les paramètres</span>
                <p className="text-xs text-gray-500 mt-0.5">Remettre tous les paramètres par défaut</p>
              </div>
              <button
                onClick={resetSettings}
                className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
