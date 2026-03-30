import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { User, Mail, Shield, Key, Camera, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const tp = t.profile;

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [discordUserId, setDiscordUserId] = useState((user as any)?.discordId || "");
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Image trop lourde (max 2 Mo)", false); return; }
    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const res = await axios.patch("/api/auth/avatar", { avatar: base64 });
        setUser({ ...user!, avatarUrl: res.data.avatarUrl } as any);
        showToast("Photo de profil mise à jour !");
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showToast("Erreur lors du téléchargement", false);
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.patch("/api/auth/profile", { username, email });
      setUser(res.data.user);
      showToast(tp.savedOk, true);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur", false);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPwd(true);
    try {
      await axios.patch("/api/auth/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      showToast(tp.passwordUpdated, true);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur", false);
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSaveDiscordId = async () => {
    try {
      await axios.patch("/api/auth/profile", { discordId: discordUserId });
      showToast("ID Discord sauvegardé !", true);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur", false);
    }
  };

  const handleTestDiscord = async () => {
    if (!discordUserId) return;
    setTestingDiscord(true);
    try {
      const res = await axios.post("/api/discord/dm", {
        userId: discordUserId,
        message: "🔒 **Nexus Security**: Ceci est un message de test pour votre configuration 2FA Discord. Si vous le recevez, l'intégration fonctionne correctement !",
      });
      if (res.status === 200) showToast(tp.testSent, true);
      else showToast(tp.testFailed, false);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "";
      if (errMsg.includes("not configured") || errMsg.includes("bot token")) {
        showToast("Bot Discord non configuré. Ajoutez DISCORD_BOT_TOKEN.", false);
      } else if (errMsg.includes("Cannot send") || errMsg.includes("DM")) {
        showToast("Impossible d'envoyer le DM. Vérifiez que le bot partage un serveur avec vous.", false);
      } else {
        showToast(tp.testFailed, false);
      }
    } finally {
      setTestingDiscord(false);
    }
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();

  return (
    <div className="flex-1 p-4 md:p-8">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}
        >
          {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <User className="h-8 w-8 md:h-10 md:w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            {tp.title}
          </span>
        </h1>
        <p className="mt-2 text-gray-400">{tp.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="lg:col-span-1 flex flex-col items-center rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.1)]"
        >
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          <div className="relative mb-6 group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-28 w-28 md:h-32 md:w-32 overflow-hidden rounded-full border-4 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black text-white">{initial}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Camera className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
          <p className="text-emerald-400 font-medium mt-1">{tp.administrator}</p>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>

          <div className="mt-8 w-full space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-gray-300">{tp.accountStatus}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{tp.verified}</span>
            </div>
            <button onClick={handleAvatarClick} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <Camera className="h-4 w-4" /> Changer la photo
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">{tp.personalInfo}</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? tp.saving : tp.saveBtn}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">{tp.securitySection}</h3>
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.currentPassword}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{t.security.newPassword}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingPwd || !currentPassword || !newPassword} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60 flex items-center gap-2">
                  {savingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
                  {savingPwd ? tp.saving : t.security.updatePassword}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl"
          >
            <h3 className="text-xl font-bold text-white mb-2 border-b border-white/10 pb-4">Discord 2FA</h3>
            <p className="text-sm text-gray-500 mb-6">Configurez votre ID Discord pour recevoir des codes de vérification par DM.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={discordUserId}
                  onChange={(e) => setDiscordUserId(e.target.value)}
                  placeholder={tp.discordIdPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                />
              </div>
              <button type="button" onClick={handleSaveDiscordId} disabled={!discordUserId} className="rounded-xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50">
                Sauvegarder
              </button>
              <button type="button" onClick={handleTestDiscord} disabled={testingDiscord || !discordUserId} className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-3 font-medium text-indigo-400 hover:bg-indigo-500/30 transition-colors disabled:opacity-50">
                {testingDiscord ? <Loader2 className="h-4 w-4 animate-spin" /> : tp.testBtn}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600">Pour obtenir votre ID : Discord → Paramètres → Avancé → Mode développeur, puis clic droit sur votre profil → Copier l'ID</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
