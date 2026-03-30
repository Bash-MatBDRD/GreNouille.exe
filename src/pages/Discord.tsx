import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { Send, MessageSquare, Terminal, Activity, AlertTriangle, ExternalLink } from "lucide-react";

export default function Discord() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/api/discord/logs");
      setLogs(res.data);
      setError("");
      setConfigured(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || "";
      if (msg.includes("not configured") || err.response?.status === 500) {
        setConfigured(false);
      } else {
        setError(msg || "Impossible de récupérer les messages");
        setConfigured(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post("/api/discord/message", { message });
      setMessage("");
      fetchLogs();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Impossible d'envoyer le message");
    } finally {
      setSending(false);
    }
  };

  if (configured === false) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <AlertTriangle className="h-10 w-10 text-yellow-400" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Configuration requise</h2>
          <p className="mb-8 text-gray-400 text-sm leading-relaxed">
            Le bot Discord n'est pas encore configuré. Ajoutez vos secrets pour activer l'intégration.
          </p>

          <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 text-left space-y-4">
            <p className="text-sm font-semibold text-white mb-4">Variables d'environnement requises :</p>

            {[
              {
                name: "DISCORD_BOT_TOKEN",
                desc: "Token de votre bot Discord",
                how: "Discord Developer Portal → Applications → Votre bot → Bot → Token",
              },
              {
                name: "DISCORD_CHANNEL_ID",
                desc: "ID du canal où envoyer les messages",
                how: "Activez le mode développeur dans Discord, faites clic droit sur le canal → Copier l'ID",
              },
            ].map((v) => (
              <div key={v.name} className="rounded-lg border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-bold text-indigo-400">{v.name}</code>
                </div>
                <p className="text-xs text-gray-400 mb-1">{v.desc}</p>
                <p className="text-xs text-gray-600">{v.how}</p>
              </div>
            ))}
          </div>

          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#5865F2] px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(88,101,242,0.3)] transition-all hover:scale-[1.02] hover:bg-[#4752C4] active:scale-95"
          >
            <ExternalLink className="h-5 w-5" />
            Discord Developer Portal
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discord Bot</h1>
          <p className="text-gray-400">Gérez l'activité du bot et envoyez des messages</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-4 py-2 text-sm text-[#5865F2]">
          <Activity className="h-4 w-4 animate-pulse" />
          Bot En Ligne
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">{error}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#5865F2]/20 p-3 text-[#5865F2]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Envoyer un message</h2>
          </div>

          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Contenu du message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2]"
                placeholder="Tapez un message à envoyer sur le canal Discord..."
              />
            </div>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 font-semibold text-white transition-all hover:bg-[#4752C4] disabled:opacity-50"
            >
              {sending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white" />
              ) : (
                <><Send className="h-5 w-5" /> Envoyer au canal</>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-inner"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-800 p-3 text-gray-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-white">Messages récents</h2>
            </div>
            <button onClick={fetchLogs} className="text-sm text-gray-400 hover:text-white transition-colors">Actualiser</button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-sm min-h-[200px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-500">Chargement...</div>
            ) : logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">Aucun message récent</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-[#5865F2]">{log.author?.username}</span>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300">{log.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
