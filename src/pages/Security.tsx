import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Key, Lock, Monitor, Check, X, Loader2,
  Eye, EyeOff, AlertTriangle, Smartphone, Globe, RefreshCw,
  ShieldCheck, ShieldOff, Clock, Trash2, Fingerprint, Scan,
  ChevronLeft, Cpu, Wifi, Battery, Info, Plus, KeyRound,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function parseDevice(ua: string) {
  if (!ua) return { name: "Appareil inconnu", icon: Monitor };
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return { name: "Mobile", icon: Smartphone };
  if (lower.includes("chrome")) return { name: `Chrome · ${ua.match(/Windows|Mac|Linux/)?.[0] || "PC"}`, icon: Monitor };
  if (lower.includes("firefox")) return { name: `Firefox · ${ua.match(/Windows|Mac|Linux/)?.[0] || "PC"}`, icon: Monitor };
  if (lower.includes("safari")) return { name: `Safari · Mac`, icon: Monitor };
  return { name: ua.slice(0, 40), icon: Monitor };
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMac = /Mac/i.test(ua) && !isMobile;
  const isWindows = /Windows/i.test(ua);

  let os = "Inconnu";
  if (isIOS) os = "iOS " + (ua.match(/OS (\d+_\d+)/)?.[1]?.replace("_", ".") || "");
  else if (isAndroid) os = "Android " + (ua.match(/Android (\d+\.?\d*)/)?.[1] || "");
  else if (isMac) os = "macOS";
  else if (isWindows) os = "Windows " + (ua.match(/Windows NT (\d+\.\d+)/)?.[1] || "");

  let browser = "Inconnu";
  if (/CriOS/i.test(ua)) browser = "Chrome (iOS)";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";

  const screen = `${window.screen.width}×${window.screen.height}`;
  const lang = navigator.language || "fr";
  const online = navigator.onLine;
  const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} Go` : null;
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cœurs` : null;
  const touch = navigator.maxTouchPoints > 0;
  const platform = isMobile ? (isIOS ? "iPhone/iPad" : "Android") : (isMac ? "Mac" : isWindows ? "PC Windows" : "Desktop");

  return { os, browser, screen, lang, online, memory, cores, touch, platform, isIOS, isAndroid, isMobile };
}

const PASSKEYS_KEY = "nexus-passkeys";

interface Passkey {
  id: string;
  name: string;
  type: "faceid" | "fingerprint" | "pin" | "securitykey";
  createdAt: string;
  lastUsed?: string;
}

const PASSKEY_ICONS = {
  faceid: Scan,
  fingerprint: Fingerprint,
  pin: KeyRound,
  securitykey: Key,
};

const PASSKEY_LABELS = {
  faceid: "Face ID",
  fingerprint: "Empreinte digitale",
  pin: "Code PIN",
  securitykey: "Clé de sécurité",
};

function loadPasskeys(): Passkey[] {
  try { return JSON.parse(localStorage.getItem(PASSKEYS_KEY) || "[]"); } catch { return []; }
}

function savePasskeys(keys: Passkey[]) {
  localStorage.setItem(PASSKEYS_KEY, JSON.stringify(keys));
}

export default function Security() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>(loadPasskeys);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [passkeyType, setPasskeyType] = useState<Passkey["type"] | null>(null);
  const [passkeyName, setPasskeyName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [deviceInfo] = useState(getDeviceInfo);
  const [activeTab, setActiveTab] = useState<"overview" | "keys" | "sessions" | "device">("overview");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [userRes, sessionsRes] = await Promise.all([
        axios.get("/api/auth/me"),
        axios.get("/api/auth/sessions"),
      ]);
      setUser(userRes.data.user);
      setSessions(sessionsRes.data.sessions || []);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) { showToast("Les mots de passe ne correspondent pas", false); return; }
    if (newPassword.length < 8) { showToast("8 caractères minimum", false); return; }
    setSavingPwd(true);
    try {
      await axios.patch("/api/auth/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showToast("Mot de passe mis à jour !");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur lors de la mise à jour", false);
    } finally { setSavingPwd(false); }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await axios.post(`/api/auth/sessions/${sessionId}/revoke`);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("Session révoquée.");
    } catch { showToast("Impossible de révoquer la session", false); }
  };

  const handleRevokeAll = async () => {
    try {
      await Promise.all(sessions.map((s) => axios.post(`/api/auth/sessions/${s.id}/revoke`)));
      setSessions([]);
      showToast("Toutes les sessions révoquées.");
    } catch { showToast("Erreur lors de la révocation", false); }
  };

  const handleAddPasskey = async () => {
    if (!passkeyType) return;
    setRegistering(true);
    try {
      if (!window.PublicKeyCredential) {
        showToast("WebAuthn non supporté sur ce navigateur", false);
        setRegistering(false);
        return;
      }

      const isPlatform = passkeyType !== "securitykey";

      if (isPlatform) {
        const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!supported) {
          showToast("Authentificateur biométrique non disponible sur cet appareil", false);
          setRegistering(false);
          return;
        }
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "NEXUS Panel",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: user?.email || user?.username || "nexus-user",
            displayName: user?.username || "Utilisateur NEXUS",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: isPlatform ? "platform" : "cross-platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential | null;

      if (!credential) {
        showToast("Enregistrement annulé", false);
        setRegistering(false);
        return;
      }

      const rawId = Array.from(new Uint8Array(credential.rawId));
      const credId = btoa(String.fromCharCode(...rawId)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      const name = passkeyName.trim() || PASSKEY_LABELS[passkeyType];
      const newKey: Passkey = {
        id: credId,
        name,
        type: passkeyType,
        createdAt: new Date().toISOString(),
      };
      const updated = [...passkeys, newKey];
      setPasskeys(updated);
      savePasskeys(updated);
      setAddingPasskey(false);
      setPasskeyType(null);
      setPasskeyName("");
      showToast(`${name} enregistré avec succès !`);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        showToast("Authentification refusée ou annulée", false);
      } else if (err?.name === "InvalidStateError") {
        showToast("Un authentificateur est déjà enregistré", false);
      } else if (err?.name === "NotSupportedError") {
        showToast("Type d'authentificateur non supporté", false);
      } else {
        showToast(err?.message || "Erreur lors de l'enregistrement", false);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleRemovePasskey = (id: string) => {
    const updated = passkeys.filter((k) => k.id !== id);
    setPasskeys(updated);
    savePasskeys(updated);
    showToast("Clé supprimée.");
  };

  const securityScore = (() => {
    let score = 20;
    if (user?.twoFactorEnabled) score += 20;
    if (user?.discordId) score += 15;
    if (sessions.length < 5) score += 15;
    if (passkeys.length > 0) score += 30;
    return Math.min(100, score);
  })();
  const scoreColor = securityScore >= 80 ? "#39FF14" : securityScore >= 50 ? "#FAA61A" : "#ED4245";

  const tabs = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "keys", label: "Clés d'accès" },
    { id: "sessions", label: "Sessions" },
    { id: "device", label: "Appareil" },
  ] as const;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}
          >
            {toast.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#06060f]/90 backdrop-blur-xl px-4 md:px-8 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/settings")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors md:hidden"
          >
            <ChevronLeft className="h-4 w-4" /> Paramètres
          </button>
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${scoreColor}20` }}>
              <Shield className="h-4 w-4" style={{ color: scoreColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Centre de Sécurité</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Score : <span className="font-semibold" style={{ color: scoreColor }}>{securityScore}%</span></p>
            </div>
          </div>
          <div className="ml-auto flex-1 hidden md:block" />
          <button onClick={fetchData} disabled={refreshing} className="ml-auto md:ml-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Score bar */}
        <div className="mt-2 h-1 w-full rounded-full bg-white/8">
          <motion.div initial={{ width: 0 }} animate={{ width: `${securityScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full" style={{ backgroundColor: scoreColor, boxShadow: `0 0 8px ${scoreColor}60` }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-4 md:space-y-6 pb-28 md:pb-8">

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Score detail cards */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
              {[
                { label: "Clés d'accès", done: passkeys.length > 0, points: 30, detail: passkeys.length > 0 ? `${passkeys.length} clé${passkeys.length > 1 ? "s" : ""}` : "Aucune" },
                { label: "2FA activée", done: !!user?.twoFactorEnabled, points: 20, detail: user?.twoFactorEnabled ? "Active" : "Inactive" },
                { label: "Discord lié", done: !!user?.discordId, points: 15, detail: user?.discordId ? "Lié" : "Non lié" },
                { label: "Sessions", done: sessions.length < 5, points: 15, detail: `${sessions.length} active${sessions.length > 1 ? "s" : ""}` },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-3 ${item.done ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/3"}`}>
                  <div className="flex items-center justify-between mb-1">
                    {item.done ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <ShieldOff className="h-4 w-4 text-gray-600" />}
                    <span className="text-[10px] font-bold text-gray-500">+{item.points}pts</span>
                  </div>
                  <p className={`text-xs font-semibold mt-1 ${item.done ? "text-emerald-300" : "text-gray-500"}`}>{item.label}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick tip */}
            {passkeys.length === 0 && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-300">Conseil</p>
                  <p className="text-xs text-blue-300/70 mt-0.5">Ajoutez une clé d'accès biométrique (Face ID ou empreinte) pour sécuriser votre compte sans mot de passe.</p>
                  <button onClick={() => setActiveTab("keys")} className="mt-2 text-xs font-semibold text-blue-400 underline">
                    Configurer maintenant →
                  </button>
                </div>
              </div>
            )}

            {/* Change password (compact) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-xl bg-[#39FF14]/20 p-2 text-[#39FF14]"><Key className="h-4 w-4" /></div>
                <h2 className="text-base font-semibold text-white">Mot de passe</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                {[
                  { label: "Actuel", value: currentPassword, setter: setCurrentPassword },
                  { label: "Nouveau", value: newPassword, setter: setNewPassword },
                  { label: "Confirmer", value: confirmPassword, setter: setConfirmPassword },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="mb-1 block text-xs font-medium text-gray-400">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 pr-9 text-sm text-white placeholder-gray-600 outline-none focus:border-[#39FF14]/50 transition-all"
                        placeholder="••••••••"
                      />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                          {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {[6, 8, 12].map((len) => (
                      <div key={len} className={`h-1 flex-1 rounded-full transition-colors ${newPassword.length >= len ? "bg-[#39FF14]" : "bg-white/10"}`} />
                    ))}
                    <span className="text-[10px] text-gray-500 ml-1">
                      {newPassword.length < 6 ? "Trop court" : newPassword.length < 8 ? "Faible" : newPassword.length < 12 ? "Correct" : "Fort"}
                    </span>
                  </div>
                )}
                <button type="submit" disabled={savingPwd || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {savingPwd && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Mettre à jour
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── TAB: Clés d'accès ── */}
        {activeTab === "keys" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400"><Fingerprint className="h-4 w-4" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Clés d'accès</h2>
                    <p className="text-[10px] text-gray-500">Face ID, empreinte, PIN, clé matérielle</p>
                  </div>
                </div>
                <button onClick={() => setAddingPasskey(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 active:scale-95 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>

              {/* Add passkey flow */}
              <AnimatePresence>
                {addingPasskey && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                      <p className="text-sm font-semibold text-white mb-3">Choisir le type de clé</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {(Object.entries(PASSKEY_LABELS) as [Passkey["type"], string][]).map(([type, label]) => {
                          const Icon = PASSKEY_ICONS[type];
                          return (
                            <button key={type} onClick={() => setPasskeyType(type)}
                              className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all active:scale-95 ${passkeyType === type ? "border-indigo-500 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/3 text-gray-400 hover:bg-white/8"}`}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="text-xs font-medium">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {passkeyType && (
                        <>
                          <input
                            value={passkeyName}
                            onChange={(e) => setPasskeyName(e.target.value)}
                            placeholder={`Nom (ex: ${PASSKEY_LABELS[passkeyType]} iPhone)`}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition-all mb-3"
                          />
                        </>
                      )}
                      <div className="flex gap-2">
                        <button onClick={handleAddPasskey} disabled={!passkeyType || registering}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
                        >
                          {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                          {registering ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button onClick={() => { setAddingPasskey(false); setPasskeyType(null); setPasskeyName(""); }}
                          className="flex-1 rounded-xl bg-white/8 py-2.5 text-sm font-medium text-gray-300 active:scale-95 transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Passkeys list */}
              {passkeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-1">
                    <Fingerprint className="h-7 w-7 text-gray-700" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Aucune clé enregistrée</p>
                  <p className="text-xs text-gray-600">Ajoutez Face ID, empreinte ou PIN pour vous connecter facilement</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {passkeys.map((key) => {
                    const Icon = PASSKEY_ICONS[key.type];
                    return (
                      <div key={key.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                          <Icon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{key.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{PASSKEY_LABELS[key.type]} · Ajouté le {new Date(key.createdAt).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <button onClick={() => handleRemovePasskey(key.id)} className="shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-500/10 active:scale-90 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2FA info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="rounded-xl bg-[#39FF14]/20 p-2 text-[#39FF14]"><Shield className="h-4 w-4" /></div>
                <h2 className="text-base font-semibold text-white">Authentification à deux facteurs</h2>
              </div>
              {user?.twoFactorEnabled ? (
                <div className="flex items-center justify-between rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#39FF14]">✓ 2FA activée</p>
                    <p className="text-xs text-[#39FF14]/70 mt-0.5">Codes envoyés à {user?.email}</p>
                  </div>
                  <button onClick={async () => { await axios.post("/api/auth/2fa/disable"); setUser({ ...user, twoFactorEnabled: 0 }); showToast("2FA désactivée."); }}
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 active:scale-95 transition-all">
                    Désactiver
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">2FA par Email</p>
                    <p className="text-xs text-gray-500 mt-0.5">Codes de vérification envoyés par email</p>
                  </div>
                  <button onClick={async () => { await axios.post("/api/auth/2fa/setup"); setUser({ ...user, twoFactorEnabled: 1 }); showToast("2FA activée !"); }}
                    className="rounded-lg bg-[#39FF14]/20 px-3 py-1.5 text-xs font-semibold text-[#39FF14] active:scale-95 transition-all">
                    Activer
                  </button>
                </div>
              )}
              <div className="mt-3 rounded-xl border border-yellow-500/15 bg-yellow-500/5 p-2.5 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-300/70">Géré par Supabase Auth. Configurez votre projet Supabase pour activer la 2FA.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: Sessions ── */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-[#39FF14]/20 p-2 text-[#39FF14]"><Lock className="h-4 w-4" /></div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Sessions actives</h2>
                    <p className="text-[10px] text-gray-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {sessions.length > 1 && (
                  <button onClick={handleRevokeAll} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 active:scale-95 transition-all">
                    <Trash2 className="h-3.5 w-3.5" /> Tout révoquer
                  </button>
                )}
              </div>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Monitor className="h-12 w-12 text-gray-700 mb-1" />
                  <p className="text-gray-500 text-sm">Aucune session active</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session, i) => {
                    const device = parseDevice(session.device || "");
                    const DeviceIcon = device.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          <DeviceIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{device.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500"><Globe className="h-2.5 w-2.5" />{session.location}</span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-600"><Clock className="h-2.5 w-2.5" />{session.time}</span>
                          </div>
                        </div>
                        {session.current ? (
                          <span className="shrink-0 rounded-full bg-[#39FF14]/20 px-2.5 py-1 text-[10px] font-medium text-[#39FF14]">Actuelle</span>
                        ) : (
                          <button onClick={() => handleRevokeSession(session.id)} className="shrink-0 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 active:scale-90 transition-all">
                            Révoquer
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB: Appareil ── */}
        {activeTab === "device" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400"><Cpu className="h-4 w-4" /></div>
                <h2 className="text-base font-semibold text-white">Informations de l'appareil</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {[
                  { label: "Plateforme", value: deviceInfo.platform, icon: Smartphone },
                  { label: "Système", value: deviceInfo.os, icon: Monitor },
                  { label: "Navigateur", value: deviceInfo.browser, icon: Globe },
                  { label: "Résolution", value: deviceInfo.screen, icon: Scan },
                  { label: "Langue", value: deviceInfo.lang, icon: Info },
                  { label: "Connexion", value: deviceInfo.online ? "En ligne ✓" : "Hors ligne", icon: Wifi },
                  ...(deviceInfo.memory ? [{ label: "RAM", value: deviceInfo.memory, icon: Cpu }] : []),
                  ...(deviceInfo.cores ? [{ label: "CPU", value: deviceInfo.cores, icon: Cpu }] : []),
                  { label: "Écran tactile", value: deviceInfo.touch ? "Oui" : "Non", icon: Fingerprint },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2.5">
                    <item.icon className="h-4 w-4 text-gray-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery (if supported) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400"><Battery className="h-4 w-4" /></div>
                <h2 className="text-base font-semibold text-white">Capacités du navigateur</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "WebAuthn", value: typeof PublicKeyCredential !== "undefined" ? "Supporté ✓" : "Non supporté", ok: typeof PublicKeyCredential !== "undefined" },
                  { label: "Notifications", value: "Notification" in window ? "Supporté ✓" : "Non supporté", ok: "Notification" in window },
                  { label: "Service Worker", value: "serviceWorker" in navigator ? "Supporté ✓" : "Non supporté", ok: "serviceWorker" in navigator },
                  { label: "Bluetooth", value: "bluetooth" in navigator ? "Supporté ✓" : "Non supporté", ok: "bluetooth" in navigator },
                ].map((cap) => (
                  <div key={cap.label} className={`rounded-xl border p-3 ${cap.ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/3"}`}>
                    <p className="text-[10px] text-gray-500">{cap.label}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${cap.ok ? "text-emerald-400" : "text-gray-600"}`}>{cap.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
