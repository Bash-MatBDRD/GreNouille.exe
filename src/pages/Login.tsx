import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
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
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(57,255,20,0.14) 0%, rgba(0,200,0,0.04) 100%)",
              border: "1px solid rgba(57,255,20,0.28)",
              boxShadow: "0 0 40px rgba(57,255,20,0.18), 0 0 80px rgba(57,255,20,0.06)",
            }}
          >
            <span
              className="text-3xl font-black select-none leading-none"
              style={{
                background: "linear-gradient(135deg, #ffffff 20%, #39FF14 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px rgba(57,255,20,0.9))",
                letterSpacing: "-0.03em",
              }}
            >
              N
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your credentials to access the panel
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
              placeholder="admin@nexus.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#39FF14] hover:text-[#00FF00]">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-[#39FF14] focus:bg-white/10 focus:ring-1 focus:ring-[#39FF14]"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#39FF14] to-[#00FF00] px-4 py-3 font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-[#39FF14] hover:text-[#00FF00]">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
