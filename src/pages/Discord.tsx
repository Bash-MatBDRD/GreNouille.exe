import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Send, MessageSquare, Terminal, Activity, AlertTriangle, ExternalLink,
  Bot, Wifi, Settings2, Sword, Hash, ChevronDown, Loader2, Check, X,
  ShieldAlert, UserX, VolumeX, Volume2, AlertCircle, Trash2,
  Download, RefreshCw, Crown, BookOpen, Smile, Shield, Megaphone, Info,
} from "lucide-react";

type Tab = "chat" | "bot" | "commands" | "warnings" | "slash";
type BotStatus = "online" | "idle" | "dnd" | "invisible";

const STATUS_COLORS: Record<BotStatus, string> = {
  online: "#3BA55D",
  idle: "#FAA61A",
  dnd: "#ED4245",
  invisible: "#747F8D",
};
const STATUS_LABELS: Record<BotStatus, string> = {
  online: "En ligne",
  idle: "Inactif",
  dnd: "Ne pas déranger",
  invisible: "Invisible",
};

// ── Slash commands reference data ──────────────────────────────────────────────

const SLASH_CATEGORIES = [
  {
    id: "info",
    label: "Informations",
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    commands: [
      { name: "/ping", desc: "Latence du bot" },
      { name: "/botinfo", desc: "Mes infos complètes" },
      { name: "/uptime", desc: "Temps en ligne du bot" },
      { name: "/help", desc: "Liste de toutes les commandes" },
      { name: "/serverinfo", desc: "Infos du serveur" },
      { name: "/userinfo", desc: "Profil complet d'un membre" },
      { name: "/avatar", desc: "Avatar d'un membre en grand" },
      { name: "/banner", desc: "Bannière de profil d'un membre" },
      { name: "/rolelist", desc: "Liste des rôles du serveur" },
      { name: "/channellist", desc: "Liste des salons" },
      { name: "/membercount", desc: "Nombre de membres" },
    ],
  },
  {
    id: "fun",
    label: "Fun",
    icon: Smile,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    commands: [
      { name: "/coinflip", desc: "Pile ou face" },
      { name: "/roll", desc: "Lance un dé (faces personnalisables)" },
      { name: "/8ball", desc: "La boule magique répond" },
      { name: "/choix", desc: "Choisit parmi plusieurs options" },
      { name: "/pp", desc: "Mesure très scientifique 📏" },
      { name: "/hug", desc: "Envoie un câlin à quelqu'un" },
      { name: "/slap", desc: "Balance une claque" },
      { name: "/iq", desc: "Calcule le QI d'un membre" },
      { name: "/niveau", desc: "Niveau de n'importe quoi pour un membre" },
      { name: "/mdr", desc: "T'es vraiment drôle toi ?" },
    ],
  },
  {
    id: "com",
    label: "Communication",
    icon: Megaphone,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    commands: [
      { name: "/embed", desc: "Envoie un message embed stylé" },
      { name: "/poll", desc: "Lance un sondage avec réactions" },
      { name: "/announce", desc: "Annonce officielle dans un salon" },
    ],
  },
  {
    id: "mod",
    label: "Modération",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    commands: [
      { name: "/ban", desc: "Bannit un membre" },
      { name: "/kick", desc: "Expulse un membre" },
      { name: "/mute", desc: "Timeout un membre (durée en minutes)" },
      { name: "/unmute", desc: "Retire le timeout" },
      { name: "/warn", desc: "Avertit et enregistre un warn" },
      { name: "/warns", desc: "Voir les warns d'un membre" },
      { name: "/clearwarns", desc: "Efface tous les warns d'un membre" },
      { name: "/clear", desc: "Supprime des messages en masse (1-100)" },
      { name: "/slowmode", desc: "Mode lent sur un salon" },
      { name: "/lock", desc: "Verrouille un salon" },
      { name: "/unlock", desc: "Déverrouille un salon" },
      { name: "/role", desc: "Ajoute ou retire un rôle" },
      { name: "/nick", desc: "Change le surnom d'un membre" },
      { name: "/unban", desc: "Débannit via ID utilisateur" },
      { name: "/banlist", desc: "Liste des membres bannis" },
    ],
  },
  {
    id: "owner",
    label: "Owner uniquement",
    icon: Crown,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    commands: [
      { name: "/say", desc: "Le bot parle, ton message disparaît instantanément" },
      { name: "/backup", desc: "Sauvegarde complète du serveur de A à Z (envoi en DM)" },
    ],
  },
];

export default function Discord() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [botInfo, setBotInfo] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<BotStatus>("online");
  const [activityName, setActivityName] = useState("");
  const [settingStatus, setSettingStatus] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  const [cmdMessage, setCmdMessage] = useState("");
  const [cmdReason, setCmdReason] = useState("");
  const [muteDuration, setMuteDuration] = useState("10");
  const [cmdLoading, setCmdLoading] = useState<string | null>(null);

  const [warnings, setWarnings] = useState<any[]>([]);
  const [warnReason, setWarnReason] = useState("");
  const [warningUserId, setWarningUserId] = useState("");
  const [warningUsername, setWarningUsername] = useState("");

  const [expandedCmd, setExpandedCmd] = useState<{ name: string; desc: string; color: string; bg: string; border: string; label: string } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchConfigured = async () => {
    try {
      const res = await axios.get("/api/discord/configured");
      setConfigured(res.data.configured);
    } catch {
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (channelId?: string) => {
    try {
      const url = channelId ? `/api/discord/logs?channelId=${channelId}` : "/api/discord/logs";
      const res = await axios.get(url);
      setLogs(res.data);
    } catch {}
  };

  const fetchBotInfo = async () => {
    try {
      const res = await axios.get("/api/discord/bot/info");
      setBotInfo(res.data);
      if (res.data.status) setBotStatus(res.data.status as BotStatus);
    } catch {}
  };

  const fetchGuilds = async () => {
    try {
      const res = await axios.get("/api/discord/bot/guilds");
      setGuilds(res.data);
      if (res.data.length > 0 && !selectedGuild) setSelectedGuild(res.data[0].id);
    } catch {}
  };

  useEffect(() => {
    fetchConfigured();
    fetchBotInfo();
    fetchGuilds();
    fetchLogs();
    const interval = setInterval(fetchLogs, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedGuild) return;
    axios.get(`/api/discord/guild/${selectedGuild}/channels`).then((r) => setChannels(r.data)).catch(() => {});
    axios.get(`/api/discord/guild/${selectedGuild}/members`).then((r) => setMembers(r.data)).catch(() => {});
  }, [selectedGuild]);

  useEffect(() => {
    if (selectedGuild && activeTab === "warnings") {
      axios.get(`/api/discord/commands/warnings?guildId=${selectedGuild}`).then((r) => setWarnings(r.data)).catch(() => {});
    }
  }, [selectedGuild, activeTab]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post("/api/discord/message", { message, channelId: selectedChannel || undefined });
      setMessage("");
      fetchLogs(selectedChannel || undefined);
      showToast("Message envoyé !");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Impossible d'envoyer le message", false);
    } finally {
      setSending(false);
    }
  };

  const handleSetStatus = async () => {
    setSettingStatus(true);
    try {
      await axios.patch("/api/discord/bot/status", { status: botStatus, activityName: activityName || undefined });
      showToast(`Statut changé : ${STATUS_LABELS[botStatus]}`);
      setStatusOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur lors du changement de statut", false);
    } finally {
      setSettingStatus(false);
    }
  };

  const runCommand = async (command: string, body: object) => {
    setCmdLoading(command);
    try {
      await axios.post(`/api/discord/commands/${command}`, body);
      showToast(`Commande ${command} exécutée !`);
      setCmdReason("");
    } catch (err: any) {
      showToast(err.response?.data?.error || `Erreur : ${command}`, false);
    } finally {
      setCmdLoading(null);
    }
  };

  const handleWarn = async () => {
    if (!selectedGuild || !warningUserId || !warnReason) return;
    await runCommand("warn", { guildId: selectedGuild, userId: warningUserId, username: warningUsername, reason: warnReason });
    setWarnReason("");
    const res = await axios.get(`/api/discord/commands/warnings?guildId=${selectedGuild}`).catch(() => ({ data: [] }));
    setWarnings(res.data);
  };

  const handleBackup = async () => {
    if (!selectedGuild) return;
    setCmdLoading("backup");
    try {
      const res = await axios.post("/api/discord/commands/backup", { guildId: selectedGuild });
      const json = JSON.stringify(res.data.backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `backup-${selectedGuild}-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast("Backup téléchargé !");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erreur lors du backup", false);
    } finally {
      setCmdLoading(null);
    }
  };

  const selectedMemberObj = members.find((m) => m.id === selectedMember);

  if (configured === false) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10">
            <AlertTriangle className="h-10 w-10 text-yellow-400" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Configuration requise</h2>
          <p className="mb-8 text-gray-400 text-sm leading-relaxed">Ajoutez vos secrets pour activer l'intégration Discord.</p>
          <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 text-left space-y-4">
            {[
              { name: "DISCORD_BOT_TOKEN", desc: "Token de votre bot Discord" },
              { name: "DISCORD_CHANNEL_ID", desc: "ID du canal par défaut (optionnel)" },
              { name: "DISCORD_GUILD_ID", desc: "ID du serveur pour les slash commands rapides (optionnel)" },
            ].map((v) => (
              <div key={v.name} className="rounded-lg border border-white/5 bg-white/5 p-4">
                <code className="text-sm font-bold text-indigo-400">{v.name}</code>
                <p className="text-xs text-gray-400 mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
          <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#5865F2] px-6 py-4 font-bold text-white hover:bg-[#4752C4] transition-colors"
          >
            <ExternalLink className="h-5 w-5" /> Discord Developer Portal
          </a>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "chat", label: "Messages", icon: MessageSquare },
    { id: "bot", label: "Bot & Statut", icon: Bot },
    { id: "commands", label: "Modération", icon: Sword },
    { id: "warnings", label: "Avertissements", icon: ShieldAlert },
    { id: "slash", label: "Commandes slash", icon: BookOpen },
  ];

  return (
    <div className="flex-1 p-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-red-500/30 bg-red-500/20 text-red-300"}`}
          >
            {toast.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discord Bot</h1>
          <p className="text-gray-400">Gérez votre bot et modérez vos serveurs</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-4 py-2 text-sm text-[#5865F2]">
          <Activity className="h-4 w-4 animate-pulse" />
          {botInfo ? botInfo.tag || "Bot Connecté" : "Vérification..."}
        </div>
      </div>

      {guilds.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <Crown className="h-4 w-4 text-yellow-400 shrink-0" />
          <select
            value={selectedGuild}
            onChange={(e) => setSelectedGuild(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-[#5865F2]"
          >
            {guilds.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.memberCount} membres)</option>)}
          </select>
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chat tab ──────────────────────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#5865F2]/20 p-3 text-[#5865F2]"><MessageSquare className="h-6 w-6" /></div>
              <h2 className="text-xl font-semibold text-white">Envoyer un message</h2>
            </div>
            {channels.length > 0 && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-300">Canal cible</label>
                <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-[#5865F2]"
                >
                  <option value="">Canal par défaut</option>
                  {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
            )}
            <form onSubmit={sendMessage} className="space-y-4">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-gray-500 outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2]"
                placeholder="Tapez votre message..."
              />
              <button type="submit" disabled={sending || !message.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 font-semibold text-white hover:bg-[#4752C4] disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Envoyer</>}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gray-800 p-3 text-gray-400"><Terminal className="h-6 w-6" /></div>
                <h2 className="text-xl font-semibold text-white">Messages récents</h2>
              </div>
              <button onClick={() => fetchLogs(selectedChannel || undefined)} className="rounded-lg bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-sm min-h-[200px] max-h-96">
              {loading ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
              ) : logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">Aucun message récent</div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="mb-1 flex items-center gap-2">
                        {log.author?.avatar && (
                          <img src={`https://cdn.discordapp.com/avatars/${log.author.id}/${log.author.avatar}.png?size=32`} className="h-5 w-5 rounded-full" alt="" />
                        )}
                        <span className="font-semibold text-[#5865F2]">{log.author?.username}</span>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-300">{log.content || <span className="text-gray-600 italic">[Message non textuel]</span>}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Bot & status tab ──────────────────────────────────────────────────── */}
      {activeTab === "bot" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#5865F2]/20 p-3 text-[#5865F2]"><Bot className="h-6 w-6" /></div>
              <h2 className="text-xl font-semibold text-white">Informations du bot</h2>
            </div>
            {botInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                  {botInfo.avatarUrl ? (
                    <img src={botInfo.avatarUrl} className="h-14 w-14 rounded-full" alt="Bot avatar" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-[#5865F2]/20 flex items-center justify-center"><Bot className="h-8 w-8 text-[#5865F2]" /></div>
                  )}
                  <div>
                    <p className="font-bold text-white text-lg">{botInfo.tag || botInfo.username}</p>
                    <p className="text-sm text-gray-500">ID: {botInfo.id}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[botInfo.status as BotStatus] || "#3BA55D" }} />
                      <span className="text-xs text-gray-400">{STATUS_LABELS[botInfo.status as BotStatus] || "En ligne"}</span>
                    </div>
                  </div>
                </div>
                {[
                  { label: "Latence", value: botInfo.ping >= 0 ? `${botInfo.ping}ms` : "N/A" },
                  { label: "Serveurs", value: botInfo.guildCount ?? guilds.length },
                  { label: "Uptime", value: botInfo.uptime ? `${Math.floor(botInfo.uptime / 3600)}h ${Math.floor((botInfo.uptime % 3600) / 60)}m` : "N/A" },
                  { label: "Gateway", value: botInfo.gatewayReady ? "Connecté" : "REST uniquement" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#5865F2]" /></div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#5865F2]/20 p-3 text-[#5865F2]"><Settings2 className="h-6 w-6" /></div>
              <h2 className="text-xl font-semibold text-white">Contrôle du statut</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Statut de présence</label>
                <div className="relative">
                  <button onClick={() => setStatusOpen(!statusOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[botStatus] }} />
                      {STATUS_LABELS[botStatus]}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${statusOpen ? "rotate-180" : ""}`} />
                  </button>
                  {statusOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-10 rounded-xl border border-white/10 bg-[#1a1a2e] p-2 shadow-xl">
                      {(Object.keys(STATUS_LABELS) as BotStatus[]).map((s) => (
                        <button key={s} onClick={() => { setBotStatus(s); setStatusOpen(false); }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${botStatus === s ? "bg-[#5865F2]/20 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Activité (optionnel)</label>
                <input type="text" value={activityName} onChange={(e) => setActivityName(e.target.value)}
                  placeholder="ex: Nexus Dashboard"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] transition-all"
                />
              </div>

              <button onClick={handleSetStatus} disabled={settingStatus}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 font-semibold text-white hover:bg-[#4752C4] disabled:opacity-50 transition-colors"
              >
                {settingStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wifi className="h-5 w-5" />}
                Appliquer le statut
              </button>

              {!botInfo?.gatewayReady && (
                <p className="text-xs text-yellow-400/70 text-center">
                  ⚠️ Le changement de statut nécessite une connexion Gateway.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Commands (moderation) tab ─────────────────────────────────────────── */}
      {activeTab === "commands" && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Membre ciblé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-[#5865F2]"
              >
                <option value="">Sélectionner un membre</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.nick || m.username} ({m.id})</option>)}
              </select>
              <input type="text" placeholder="Raison de la sanction"
                value={cmdReason} onChange={(e) => setCmdReason(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#5865F2]"
              />
            </div>
            {selectedMemberObj && (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-black/20 px-4 py-2">
                {selectedMemberObj.avatar && <img src={selectedMemberObj.avatar} className="h-8 w-8 rounded-full" alt="" />}
                <div>
                  <p className="text-sm font-medium text-white">{selectedMemberObj.nick || selectedMemberObj.username}</p>
                  <p className="text-xs text-gray-500">ID: {selectedMemberObj.id}</p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Say */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Hash className="h-5 w-5 text-[#5865F2]" />
                <h3 className="font-semibold text-white">/say</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Faire parler le bot dans un canal</p>
              <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full mb-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-[#5865F2]"
              >
                <option value="">Canal par défaut</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
              <textarea value={cmdMessage} onChange={(e) => setCmdMessage(e.target.value)} rows={2}
                placeholder="Message du bot..."
                className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#5865F2] mb-2"
              />
              <button onClick={() => runCommand("say", { channelId: selectedChannel, message: cmdMessage })}
                disabled={!cmdMessage || cmdLoading === "say"}
                className="w-full rounded-lg bg-[#5865F2] py-2 text-sm font-semibold text-white hover:bg-[#4752C4] disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
              >
                {cmdLoading === "say" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer
              </button>
            </motion.div>

            {/* Ban */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-white">Ban / Cleanban</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Bannir un membre du serveur</p>
              <div className="flex gap-2">
                <button onClick={() => runCommand("ban", { guildId: selectedGuild, userId: selectedMember, reason: cmdReason })}
                  disabled={!selectedMember || !selectedGuild || cmdLoading === "ban"}
                  className="flex-1 rounded-lg bg-red-500/20 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                >
                  {cmdLoading === "ban" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Ban
                </button>
                <button onClick={() => runCommand("cleanban", { guildId: selectedGuild, userId: selectedMember, reason: cmdReason })}
                  disabled={!selectedMember || !selectedGuild || cmdLoading === "cleanban"}
                  className="flex-1 rounded-lg bg-red-500/30 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/40 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                >
                  {cmdLoading === "cleanban" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Cleanban
                </button>
              </div>
            </motion.div>

            {/* Kick */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-400" />
                <h3 className="font-semibold text-white">Kick</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Expulser un membre du serveur</p>
              <button onClick={() => runCommand("kick", { guildId: selectedGuild, userId: selectedMember, reason: cmdReason })}
                disabled={!selectedMember || !selectedGuild || cmdLoading === "kick"}
                className="w-full rounded-lg bg-orange-500/20 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
              >
                {cmdLoading === "kick" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />} Kick
              </button>
            </motion.div>

            {/* Mute */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <VolumeX className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Mute / Unmute</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Mettre en sourdine (timeout)</p>
              <div className="mb-2 flex items-center gap-2">
                <input type="number" value={muteDuration} onChange={(e) => setMuteDuration(e.target.value)} min={1} max={40320}
                  className="w-24 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-yellow-500"
                />
                <span className="text-xs text-gray-400">minutes</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => runCommand("mute", { guildId: selectedGuild, userId: selectedMember, duration: parseInt(muteDuration), reason: cmdReason })}
                  disabled={!selectedMember || !selectedGuild || cmdLoading === "mute"}
                  className="flex-1 rounded-lg bg-yellow-500/20 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                >
                  {cmdLoading === "mute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <VolumeX className="h-4 w-4" />} Mute
                </button>
                <button onClick={() => runCommand("clearmute", { guildId: selectedGuild, userId: selectedMember })}
                  disabled={!selectedMember || !selectedGuild || cmdLoading === "clearmute"}
                  className="flex-1 rounded-lg bg-green-500/20 py-2 text-sm font-semibold text-green-400 hover:bg-green-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                >
                  {cmdLoading === "clearmute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} Unmute
                </button>
              </div>
            </motion.div>

            {/* Swipe */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Swipe (nuke)</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Supprimer et recréer un canal</p>
              <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full mb-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="">Sélectionner un canal</option>
                {channels.map((c) => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
              <button onClick={() => runCommand("swipe", { channelId: selectedChannel, guildId: selectedGuild })}
                disabled={!selectedChannel || !selectedGuild || cmdLoading === "swipe"}
                className="w-full rounded-lg bg-purple-500/20 py-2 text-sm font-semibold text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
              >
                {cmdLoading === "swipe" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Nuke le canal
              </button>
            </motion.div>

            {/* Backup */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Backup serveur</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Exporter la structure du serveur (canaux, rôles) en JSON</p>
              <button onClick={handleBackup} disabled={!selectedGuild || cmdLoading === "backup"}
                className="w-full rounded-lg bg-emerald-500/20 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
              >
                {cmdLoading === "backup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Télécharger le backup
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Warnings tab ──────────────────────────────────────────────────────── */}
      {activeTab === "warnings" && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-4 font-semibold text-white">Donner un avertissement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={selectedMember} onChange={(e) => { setSelectedMember(e.target.value); const m = members.find((mm) => mm.id === e.target.value); setWarningUserId(e.target.value); setWarningUsername(m?.nick || m?.username || ""); }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-[#5865F2]"
              >
                <option value="">Sélectionner un membre</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.nick || m.username}</option>)}
              </select>
              <input type="text" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} placeholder="Raison de l'avertissement..."
                className="md:col-span-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#5865F2]"
              />
            </div>
            <button onClick={handleWarn} disabled={!warningUserId || !warnReason || !selectedGuild}
              className="mt-3 flex items-center gap-2 rounded-xl bg-yellow-500/20 px-5 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
            >
              <AlertCircle className="h-4 w-4" /> Avertir
            </button>
          </motion.div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-300">Historique des avertissements ({warnings.length})</h3>
            {warnings.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <ShieldAlert className="h-12 w-12 text-gray-700 mb-3" />
                <p className="text-gray-500">Aucun avertissement enregistré</p>
              </div>
            ) : (
              warnings.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                  <div>
                    <p className="font-medium text-white">{w.username} <span className="text-xs text-gray-500">({w.userId})</span></p>
                    <p className="text-sm text-yellow-300 mt-0.5">{w.reason}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Par {w.warnedBy} · {new Date(w.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={async () => { await axios.post("/api/discord/commands/clearwarn", { guildId: selectedGuild, warnId: w.id }); setWarnings(warnings.filter((x) => x.id !== w.id)); }}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Slash commands reference tab ──────────────────────────────────────── */}
      {activeTab === "slash" && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/5 p-5"
          >
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-[#5865F2] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Toutes les commandes slash du bot</p>
                <p className="text-xs text-gray-400">
                  Ces commandes s'utilisent directement dans Discord avec <code className="text-[#5865F2]">/</code>.
                  Tu peux aussi mentionner <code className="text-[#5865F2]">@GreNouille.exe</code> pour un accès rapide.
                  Les commandes Owner (👑) sont réservées à l'ID <code className="text-amber-400">785872940347949056</code>.
                  <span className="ml-1 text-gray-500">· Clique sur une commande pour voir ses détails.</span>
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-5">
            {SLASH_CATEGORIES.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.05 }}
                  className={`rounded-2xl border ${cat.border} ${cat.bg} p-5`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                    <h3 className="font-semibold text-white">{cat.label}</h3>
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                      {cat.commands.length} commande{cat.commands.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.commands.map((cmd) => (
                      <button
                        key={cmd.name}
                        onClick={() => setExpandedCmd({ ...cmd, color: cat.color, bg: cat.bg, border: cat.border, label: cat.label })}
                        className="flex flex-col gap-0.5 rounded-xl bg-black/30 px-3 py-2.5 border border-white/5 text-left hover:bg-black/50 hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <code className={`text-sm font-bold ${cat.color}`}>{cmd.name}</code>
                        <span className="text-xs text-gray-400 leading-tight">{cmd.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/5 bg-white/3 p-5"
          >
            <p className="text-xs text-gray-500 text-center">
              Total : <span className="text-white font-semibold">{SLASH_CATEGORIES.reduce((a, c) => a + c.commands.length, 0)} commandes</span> disponibles
              · Préfixe mention : <code className="text-[#5865F2]">@GreNouille.exe</code>
              · Préfixe slash : <code className="text-[#5865F2]">/</code>
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Command detail overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedCmd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setExpandedCmd(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-3xl border ${expandedCmd.border} ${expandedCmd.bg} p-8 shadow-2xl backdrop-blur-xl`}
            >
              <button
                onClick={() => setExpandedCmd(null)}
                className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-gray-400 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${expandedCmd.color} opacity-70`}>{expandedCmd.label}</p>
              <h2 className={`mb-4 text-4xl font-black ${expandedCmd.color}`}>
                <code>{expandedCmd.name}</code>
              </h2>
              <p className="text-lg text-gray-200 leading-relaxed">{expandedCmd.desc}</p>
              <p className="mt-6 text-xs text-gray-500">
                Utilise cette commande dans Discord avec le préfixe <code className="text-[#5865F2]">/</code>.
                Clique en dehors pour fermer.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
