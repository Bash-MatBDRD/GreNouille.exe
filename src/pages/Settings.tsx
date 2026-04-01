import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings as SettingsIcon, Bell, Lock, Palette, Trash2, Check, Sparkles } from "lucide-react";
import { type SplashTheme, SPLASH_KEY, SPLASH_ENABLED_KEY } from "../components/Splashscreen";

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

const splashOptions: { id: SplashTheme; label: string; description: string; preview: React.ReactNode }[] = [
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
          <span className="text-white text-[9px] font-medium" style={{ fontFamily: "-apple-system, sans-serif" }}>Nexus Panel</span>
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
    description: "Texte épuré, lettres par lettres",
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
    id: "matrix",
    label: "Matrix",
    description: "Pluie de code digitale",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute text-[6px] font-mono" style={{ left: `${i * 14}%`, top: 0, color: "#4F6EF7", writingMode: "vertical-rl", lineHeight: "8px", opacity: Math.random() * 0.8 + 0.2 }}>
              {["0","1","ア","イ","N","E","X"].join("")}
            </div>
          ))}
        </div>
        <div className="relative z-10 px-2 py-1 rounded border border-indigo-500/50 bg-black/70">
          <span className="text-indigo-400 text-[8px] font-mono tracking-widest">NEXUS</span>
        </div>
      </div>
    ),
  },
];

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

  return (
    <div className="flex-1 p-6 md:p-8">
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
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 transition-opacity duration-200 ${!splashEnabled ? "opacity-40 pointer-events-none" : ""}`}>
            {splashOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateSplash(opt.id)}
                className={`group flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                  splashTheme === opt.id
                    ? "border-indigo-500 shadow-[0_0_20px_rgba(79,110,247,0.4)]"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className="h-28 w-full relative">
                  {opt.preview}
                  {splashTheme === opt.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className={`px-3 py-2 text-left ${splashTheme === opt.id ? "bg-indigo-500/10" : "bg-white/3"}`}>
                  <p className={`text-xs font-semibold ${splashTheme === opt.id ? "text-indigo-300" : "text-white"}`}>{opt.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
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
