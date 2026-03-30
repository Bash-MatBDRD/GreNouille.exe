import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Key, Lock, Monitor, Check, X, Loader2 } from "lucide-react";
import axios from "axios";

export default function Security() {
  const [user, setUser] = useState<any>(null);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sessionsRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get("/api/auth/sessions"),
        ]);
        setUser(userRes.data.user);
        setSessions(sessionsRes.data.sessions || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/setup");
      setUser({ ...user, twoFactorEnabled: 1 });
      setIsSettingUp2FA(false);
      showToast("2FA activé avec succès !");
    } catch {
      showToast("Impossible d'activer la 2FA", false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await axios.post("/api/auth/2fa/disable");
      setUser({ ...user, twoFactorEnabled: 0 });
      showToast("2FA désactivé.");
    } catch {
      showToast("Impossible de désactiver la 2FA", false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await axios.post(`/api/auth/sessions/${sessionId}/revoke`);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("Session révoquée avec succès.");
    } catch {
      showToast("Impossible de révoquer la session", false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPwd(true);
    try {
      await axios.patch("/api/auth/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      showToast("Mot de passe mis à jour !");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur lors de la mise à jour", false);
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
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
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Centre de Sécurité</h1>
        <p className="text-gray-400">Gérez la sécurité de votre compte et les paramètres d'authentification</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Authentification à deux facteurs</h2>
          </div>

          <p className="mb-6 text-sm text-gray-400">
            Ajoutez une couche de sécurité supplémentaire à votre compte en activant la 2FA par email.
          </p>

          {!user?.twoFactorEnabled && !isSettingUp2FA && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
              <div>
                <p className="font-medium text-white">2FA par Email</p>
                <p className="text-xs text-gray-500">Recevoir des codes de vérification par email</p>
              </div>
              <button
                onClick={() => setIsSettingUp2FA(true)}
                className="rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] transition-colors hover:bg-[#39FF14]/30"
              >
                Configurer
              </button>
            </div>
          )}

          {isSettingUp2FA && (
            <div className="mb-4 rounded-xl border border-white/5 bg-black/40 p-4">
              <p className="mb-4 text-sm text-gray-300">
                Voulez-vous activer la 2FA par email ? Les codes seront envoyés à <strong className="text-white">{user?.email}</strong>.
              </p>
              <div className="flex gap-2">
                <button onClick={handleEnable2FA} className="flex-1 rounded-lg bg-[#39FF14]/20 px-4 py-2 text-sm font-medium text-[#39FF14] transition-colors hover:bg-[#39FF14]/30">
                  Activer
                </button>
                <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {user?.twoFactorEnabled ? (
            <div className="flex items-center justify-between rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-4">
              <div>
                <p className="font-medium text-[#39FF14]">2FA par Email Activé</p>
                <p className="text-xs text-[#39FF14]/70">Codes envoyés à {user?.email}</p>
              </div>
              <button onClick={handleDisable2FA} className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30">
                Désactiver
              </button>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Gestion du Mot de Passe</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={savingPwd || !currentPassword || !newPassword}
              className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#39FF14]/20 p-3 text-[#39FF14]">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Sessions Actives</h2>
              <p className="text-xs text-gray-500 mt-0.5">Les sessions sont réinitialisées après chaque déploiement en production</p>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Monitor className="h-12 w-12 text-gray-700 mb-3" />
                <p className="text-gray-500 font-medium">Aucune session active</p>
                <p className="text-xs text-gray-600 mt-1">Vos sessions apparaîtront ici après vous être connecté</p>
              </div>
            ) : (
              sessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                      <Monitor className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white max-w-[200px] md:max-w-sm truncate">{session.device}</p>
                      <p className="text-xs text-gray-500">{session.location} · {session.time}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <span className="rounded-full bg-[#39FF14]/20 px-3 py-1 text-xs font-medium text-[#39FF14]">Session actuelle</span>
                  ) : (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
