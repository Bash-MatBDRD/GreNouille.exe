import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { User, Mail, Shield, Key, Camera, Check, X } from "lucide-react";
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
  const [discordUserId, setDiscordUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.patch("/api/auth/profile", { username, email });
      setUser(res.data.user);
      showToast(tp.savedOk, true);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Error", false);
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
      setCurrentPassword("");
      setNewPassword("");
      showToast(tp.passwordUpdated, true);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Error", false);
    } finally {
      setSavingPwd(false);
    }
  };

  const handleTestDiscord = async () => {
    if (!discordUserId) return;
    setTestingDiscord(true);
    try {
      const res = await axios.post("/api/discord/dm", {
        userId: discordUserId,
        message: "🔒 **Nexus Security**: This is a test message for your 2FA setup. If you received this, your Discord integration is working correctly!",
      });
      if (res.status === 200) showToast(tp.testSent, true);
      else showToast(tp.testFailed, false);
    } catch {
      showToast(tp.testFailed, false);
    } finally {
      setTestingDiscord(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${
            toast.ok
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
              : "border-red-500/30 bg-red-500/20 text-red-300"
          }`}
        >
          {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <User className="h-8 w-8 md:h-10 md:w-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
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
          <div className="relative mb-6 group cursor-pointer">
            <div className="h-28 w-28 md:h-32 md:w-32 overflow-hidden rounded-full border-4 border-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-black text-white">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
          <p className="text-emerald-400 font-medium mt-1">{tp.administrator}</p>

          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-gray-300">{tp.accountStatus}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{tp.verified}</span>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(20,184,166,0.1)]"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">{tp.personalInfo}</h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  {saving ? tp.saving : tp.saveBtn}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(20,184,166,0.1)]"
          >
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">{tp.securitySection}</h3>

            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.currentPassword}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">{tp.discordId}</label>
                  <div className="relative flex gap-2">
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
                    <button
                      type="button"
                      onClick={handleTestDiscord}
                      disabled={testingDiscord || !discordUserId}
                      className="rounded-xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50"
                    >
                      {testingDiscord ? "..." : tp.testBtn}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  {t.security.newPassword}
                </label>
                <div className="relative max-w-sm">
                  <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPwd || !currentPassword || !newPassword}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  {savingPwd ? tp.saving : t.security.updatePassword}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
