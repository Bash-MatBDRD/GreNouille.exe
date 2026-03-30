import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Music, MessageSquare, LogOut, Settings, User, StickyNote, ChevronLeft, ChevronRight, Shield, Bookmark, CheckSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useIsMobile } from "../hooks/useMediaQuery";

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isMobile = useIsMobile();

  const isCollapsed = !isPinned && !isHovered;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.nav.dashboard },
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
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${isActive ? "text-indigo-300" : "text-gray-500 hover:text-indigo-300"}`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
            </NavLink>
          ))}
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${isActive ? "text-indigo-300" : "text-gray-500 hover:text-indigo-300"}`}>
            <User className="h-5 w-5 shrink-0" />
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors ${isActive ? "text-indigo-300" : "text-gray-500 hover:text-indigo-300"}`}>
            <Settings className="h-5 w-5 shrink-0" />
          </NavLink>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-gray-500 transition-colors hover:text-red-400">
            <LogOut className="h-5 w-5 shrink-0" />
          </button>
        </div>
      </nav>
    );
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
        <div
          className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(145deg, rgba(79,110,247,0.22) 0%, rgba(124,58,237,0.14) 100%)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 0 0 1px rgba(79,110,247,0.15), 0 0 14px rgba(79,110,247,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <span
            className="text-sm font-black select-none leading-none"
            style={{
              color: "#ffffff",
              textShadow: "0 0 10px rgba(100,130,255,0.9), 0 0 20px rgba(79,110,247,0.5)",
              letterSpacing: "-0.04em",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            N
          </span>
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
        onClick={handleLogout}
        className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400`}
        title={isCollapsed ? t.nav.logout : undefined}
      >
        <LogOut className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? "" : "group-hover:-translate-x-1"}`} />
        {!isCollapsed && <span className="whitespace-nowrap">{t.nav.logout}</span>}
      </button>
    </div>
  );
}
