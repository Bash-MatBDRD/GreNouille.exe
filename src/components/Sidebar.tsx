import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Music, MessageSquare, LogOut, Settings, User, StickyNote, ChevronLeft, ChevronRight, Shield, Bookmark, CheckSquare, Lock, Bot, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import MobileNav from "./MobileNav";

const LOGO_COLOR_KEY = "nexus-logo-color";

const logoColors = [
  { id: "indigo", label: "Indigo", bg: "rgba(79,110,247,0.22)", border: "rgba(79,110,247,0.4)", glow: "rgba(79,110,247,0.5)", text: "rgba(100,130,255,0.9)" },
  { id: "violet", label: "Violet", bg: "rgba(139,92,246,0.22)", border: "rgba(139,92,246,0.4)", glow: "rgba(139,92,246,0.5)", text: "rgba(167,139,250,0.9)" },
  { id: "cyan", label: "Cyan", bg: "rgba(34,211,238,0.18)", border: "rgba(34,211,238,0.4)", glow: "rgba(34,211,238,0.5)", text: "rgba(34,211,238,0.9)" },
  { id: "emerald", label: "Emerald", bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.4)", glow: "rgba(16,185,129,0.5)", text: "rgba(16,185,129,0.9)" },
  { id: "rose", label: "Rose", bg: "rgba(244,63,94,0.18)", border: "rgba(244,63,94,0.4)", glow: "rgba(244,63,94,0.5)", text: "rgba(244,63,94,0.9)" },
  { id: "amber", label: "Ambre", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.4)", glow: "rgba(245,158,11,0.5)", text: "rgba(245,158,11,0.9)" },
  { id: "white", label: "Blanc", bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.3)", glow: "rgba(255,255,255,0.4)", text: "rgba(255,255,255,0.9)" },
];

function LogoColorPicker({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const pick = (id: string) => {
    setSelected(id);
    localStorage.setItem(LOGO_COLOR_KEY, id);
    window.dispatchEvent(new Event("nexus-logo-color-change"));
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute left-14 top-0 z-[100] rounded-2xl border border-white/10 p-3 shadow-2xl"
      style={{ background: "rgba(5,5,20,0.98)", backdropFilter: "blur(20px)", minWidth: 160 }}
    >
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2.5 px-1">Couleur du logo</p>
      <div className="grid grid-cols-4 gap-1.5">
        {logoColors.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c.id)}
            title={c.label}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: selected === c.id ? `0 0 10px ${c.glow}` : "none" }}
          >
            {selected === c.id && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function useLogoColor() {
  const [colorId, setColorId] = useState(() => localStorage.getItem(LOGO_COLOR_KEY) || "indigo");

  useEffect(() => {
    const handler = () => setColorId(localStorage.getItem(LOGO_COLOR_KEY) || "indigo");
    window.addEventListener("nexus-logo-color-change", handler);
    return () => window.removeEventListener("nexus-logo-color-change", handler);
  }, []);

  return logoColors.find((c) => c.id === colorId) || logoColors[0];
}

export default function Sidebar() {
  const { signOut, lock, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isMobile = useIsMobile();
  const logoColor = useLogoColor();

  const isCollapsed = !isPinned && !isHovered;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/ai", icon: Bot, label: "NEXUS AI" },
    { to: "/spotify", icon: Music, label: t.nav.spotify },
    { to: "/discord", icon: MessageSquare, label: t.nav.discord },
    { to: "/analytics", icon: StickyNote, label: t.nav.analytics },
    { to: "/security", icon: Shield, label: t.nav.security },
    { to: "/database", icon: Bookmark, label: t.nav.database },
    { to: "/logs", icon: CheckSquare, label: t.nav.logs },
    { to: "/profile", icon: User, label: t.nav.profile },
    { to: "/settings", icon: Settings, label: t.nav.settings },
  ];

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();

  if (isMobile) {
    return <MobileNav />;
  }

  return (
    <div
      style={{ width: isCollapsed ? 80 : 256 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-screen flex-col border-r border-white/10 bg-[#050505] p-4 z-50 transition-[width] duration-200 ease-in-out shrink-0"
    >
      <button
        onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white hover:bg-white/20 transition-colors duration-200"
      >
        {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className={`mb-12 flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-2 mt-4`}>
        <div className="relative">
          <AnimatePresence>
            {showColorPicker && <LogoColorPicker onClose={() => setShowColorPicker(false)} />}
          </AnimatePresence>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Changer la couleur du logo"
            className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(145deg, ${logoColor.bg} 0%, rgba(0,0,0,0.1) 100%)`,
              border: `1px solid ${logoColor.border}`,
              boxShadow: `0 0 0 1px ${logoColor.bg}, 0 0 14px ${logoColor.glow}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <span
              className="text-sm font-black select-none leading-none"
              style={{
                color: "#ffffff",
                textShadow: `0 0 10px ${logoColor.text}, 0 0 20px ${logoColor.glow}`,
                letterSpacing: "-0.04em",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              N
            </span>
          </button>
        </div>
        {!isCollapsed && (
          <h1
            className="text-xl font-black tracking-[0.2em] whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, rgba(160,180,255,0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NEXUS
          </h1>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-indigo-300"
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="relative z-10 h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && user && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initial}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      )}

      <button
        onClick={lock}
        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-yellow-500/10 hover:text-yellow-400 mb-1`}
        title={isCollapsed ? "Verrouiller" : undefined}
      >
        <Lock className={`h-5 w-5 shrink-0 transition-transform duration-200`} />
        {!isCollapsed && <span className="whitespace-nowrap">Verrouiller</span>}
      </button>

      <button
        onClick={handleLogout}
        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400`}
        title={isCollapsed ? t.nav.logout : undefined}
      >
        <LogOut className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? "" : "group-hover:-translate-x-1"}`} />
        {!isCollapsed && <span className="whitespace-nowrap">{t.nav.logout}</span>}
      </button>
    </div>
  );
}
