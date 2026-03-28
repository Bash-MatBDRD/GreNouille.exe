import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { Mail, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      setStatus("success");
      setMessage("A reset link has been sent to your email address.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to send reset link");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(57,255,20,0.15),rgba(255,255,255,0))]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(57,255,20,0.1)] backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
            <span className="font-mono text-xl font-bold text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,1)]">&gt;_</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to receive a reset link
          </p>
        </div>

        {status === "error" && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {message}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center">
            <div className="mb-6 rounded-lg bg-[#39FF14]/10 p-4 text-sm text-[#39FF14] border border-[#39FF14]/20">
              {message}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Check your inbox (and spam folder) for the link.
            </p>
            <Link to="/login" className="font-medium text-[#39FF14] hover:text-[#00FF00]">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
                  placeholder="admin@nexus.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-[#39FF14] hover:text-[#00FF00]">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
