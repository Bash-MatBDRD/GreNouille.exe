import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const lc = t.signup;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (authError) throw authError;
      if (data.session) {
        navigate("/dashboard");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={pageStyle}>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-xl"
          style={cardStyle}
        >
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl" style={logoStyle}>
            <span className="text-3xl font-black select-none leading-none" style={{ color: "#fff", textShadow: "0 0 16px rgba(100,130,255,0.9)", letterSpacing: "-0.04em" }}>N</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{lc.successTitle}</h2>
          <p className="text-gray-400 text-sm mb-6">
            {lc.successText}{" "}
            <span className="text-indigo-400">{email}</span>.{" "}
            {lc.successSub}
          </p>
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
            {lc.backToLogin}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={pageStyle}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        style={cardStyle}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={logoStyle}>
            <span className="text-3xl font-black select-none leading-none" style={{ color: "#fff", textShadow: "0 0 16px rgba(100,130,255,0.9), 0 0 36px rgba(79,110,247,0.5)", letterSpacing: "-0.04em", fontFamily: "system-ui, -apple-system, sans-serif" }}>N</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{lc.title}</h1>
          <p className="mt-2 text-sm text-gray-400">{lc.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">{lc.username}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
              placeholder="johndoe"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">{lc.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
              placeholder="john@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">{lc.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl px-4 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={btnStyle}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? lc.submitting : lc.submit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          {lc.hasAccount}{" "}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            {lc.signIn}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
