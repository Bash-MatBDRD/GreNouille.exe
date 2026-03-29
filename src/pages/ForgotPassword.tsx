import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { Mail, Loader2 } from "lucide-react";

const logoStyle = {
  background: "linear-gradient(145deg, rgba(79,110,247,0.22) 0%, rgba(124,58,237,0.14) 100%)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 0 0 1px rgba(79,110,247,0.15), 0 0 30px rgba(79,110,247,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
};
const pageStyle = {
  background: "#05050f",
  backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,247,0.18), transparent)",
};
const cardStyle = {
  boxShadow: "0 0 40px rgba(79,110,247,0.1), 0 0 80px rgba(79,110,247,0.04)",
};
const btnStyle = {
  background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 100%)",
  boxShadow: "0 0 20px rgba(79,110,247,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setStatus("success");
      setMessage("A reset link has been sent to your email address.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to send reset link");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={pageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        style={cardStyle}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={logoStyle}>
            <span className="text-3xl font-black select-none leading-none" style={{ color: "#fff", textShadow: "0 0 16px rgba(100,130,255,0.9), 0 0 36px rgba(79,110,247,0.5)", letterSpacing: "-0.04em", fontFamily: "system-ui, -apple-system, sans-serif" }}>N</span>
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
            <div className="mb-6 rounded-lg bg-indigo-500/10 p-4 text-sm text-indigo-300 border border-indigo-500/20">
              {message}
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Check your inbox (and spam folder) for the link.
            </p>
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
                  placeholder="admin@nexus.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl px-4 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={btnStyle}
            >
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
