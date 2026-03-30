import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings as SettingsIcon, Bell, Lock, Palette, Trash2, Check } from "lucide-react";

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

export default function Settings() {
  const [settings, setSettings] = useState<NexusSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const update = (key: keyof NexusSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
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
    <div className="flex-1 p-8">
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
