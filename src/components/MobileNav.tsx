import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Music, Bot, CalendarDays, MessageSquare,
  Shield, Settings, User, LogOut, Lock, X, Play, Pause,
  ChevronRight, LayoutGrid, StickyNote, Bookmark, CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";

const navItems = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard",  color: "#818cf8" },
  { to: "/ai",         icon: Bot,             label: "NEXUS AI",   color: "#a78bfa" },
  { to: "/agenda",     icon: CalendarDays,    label: "Agenda",     color: "#38bdf8" },
  { to: "/spotify",    icon: Music,           label: "Spotify",    color: "#34d399" },
];

const drawerCategories = [
  {
    label: "Applications",
    items: [
      { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard",   color: "text-indigo-400",  bg: "bg-indigo-500/15" },
      { to: "/ai",         icon: Bot,             label: "NEXUS AI",    color: "text-violet-400",  bg: "bg-violet-500/15" },
      { to: "/spotify",    icon: Music,           label: "Spotify",     color: "text-emerald-400", bg: "bg-emerald-500/15" },
      { to: "/discord",    icon: MessageSquare,   label: "Discord",     color: "text-blue-400",    bg: "bg-blue-500/15" },
      { to: "/agenda",     icon: CalendarDays,    label: "Agenda",      color: "text-sky-400",     bg: "bg-sky-500/15" },
      { to: "/analytics",  icon: StickyNote,      label: "Notes",       color: "text-yellow-400",  bg: "bg-yellow-500/15" },
      { to: "/widgets",    icon: LayoutGrid,      label: "Widgets",     color: "text-cyan-400",    bg: "bg-cyan-500/15" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { to: "/database",  icon: Bookmark,     label: "Base",       color: "text-teal-400",   bg: "bg-teal-500/15" },
      { to: "/logs",      icon: CheckSquare,  label: "Tâches",     color: "text-orange-400", bg: "bg-orange-500/15" },
      { to: "/security",  icon: Shield,       label: "Sécurité",   color: "text-red-400",    bg: "bg-red-500/15" },
      { to: "/settings",  icon: Settings,     label: "Paramètres", color: "text-gray-400",   bg: "bg-gray-500/15" },
      { to: "/profile",   icon: User,         label: "Profil",     color: "text-pink-400",   bg: "bg-pink-500/15" },
    ],
  },
];

export default function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut, lock, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useSpotify();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate("/login");
  };

  const avatarUrl = (user as any)?.avatarUrl;
  const initial = user?.username?.[0]?.toUpperCase();
  const isMoreActive = drawerOpen || !navItems.some((i) => location.pathname === i.to);

  return (
    <>
      {/* ── Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.8 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
              style={{ background: "rgba(5,5,15,0.97)", backdropFilter: "blur(32px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-4 pb-[env(safe-area-inset-bottom,20px)] pb-5 max-h-[80vh] overflow-y-auto">

                {/* User card */}
                {user && (
                  <div className="flex items-center gap-3 py-3 mb-2 border-b border-white/8">
                    <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-white/10">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{initial}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate("/profile"); setDrawerOpen(false); }}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Profil <ChevronRight className="h-3 w-3" />
                    </button>
                    <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-full text-gray-600 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Spotify mini player */}
                {currentTrack && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4 rounded-2xl border border-[#1DB954]/20 bg-[#1DB954]/8 px-3 py-2.5 cursor-pointer"
                    onClick={() => { navigate("/spotify"); setDrawerOpen(false); }}
                  >
                    {currentTrack.album?.images?.[0]?.url && (
                      <img src={currentTrack.album.images[0].url} alt="" className="h-9 w-9 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{currentTrack.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); isPlaying ? pauseTrack() : playTrack(); }}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954] active:scale-90 transition-transform"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 text-black" /> : <Play className="h-3.5 w-3.5 text-black ml-0.5" />}
                    </button>
                  </motion.div>
                )}

                {/* Nav categories */}
                {drawerCategories.map((cat) => (
                  <div key={cat.label} className="mb-4">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 px-1">{cat.label}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {cat.items.map((item, i) => (
                        <motion.div key={item.to}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.02, type: "spring", stiffness: 400 }}
                        >
                          <NavLink to={item.to} onClick={() => setDrawerOpen(false)}
                            className={({ isActive }) =>
                              `flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-all active:scale-95 ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isActive ? "bg-indigo-500/25 border border-indigo-500/30" : `${item.bg}`}`}>
                                  <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-300" : item.color}`} />
                                </div>
                                <span className={`text-[9px] font-medium text-center leading-tight ${isActive ? "text-indigo-300" : "text-gray-500"}`}>
                                  {item.label.split(" ")[0]}
                                </span>
                              </>
                            )}
                          </NavLink>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/8">
                  <button onClick={() => { lock(); setDrawerOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold active:scale-95 transition-all"
                  >
                    <Lock className="h-3.5 w-3.5" /> Verrouiller
                  </button>
                  <button onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold active:scale-95 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40"
        style={{ background: "rgba(5,5,15,0.92)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Spotify mini bar */}
        <AnimatePresence>
          {currentTrack && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-[#1DB954]/10"
              onClick={() => navigate("/spotify")}
            >
              <div className="flex items-center gap-2.5 px-4 py-2 cursor-pointer active:bg-white/5 transition-colors">
                {currentTrack.album?.images?.[0]?.url && (
                  <img src={currentTrack.album.images[0].url} alt="" className="h-7 w-7 rounded-md shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{currentTrack.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); isPlaying ? pauseTrack() : playTrack(); }}
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1DB954] active:scale-90 transition-transform"
                >
                  {isPlaying ? <Pause className="h-3 w-3 text-black" /> : <Play className="h-3 w-3 text-black ml-0.5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav tabs */}
        <div className="flex items-end justify-around px-1 pt-1 pb-[max(env(safe-area-inset-bottom,0px),8px)]">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all active:scale-90 min-w-0"
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: `${item.color}20`, boxShadow: `0 0 12px ${item.color}30` }}
                        transition={{ type: "spring", damping: 22, stiffness: 350 }}
                      />
                    )}
                    <div className={`relative p-2 rounded-xl`}>
                      <item.icon
                        className="h-5 w-5 transition-colors duration-200"
                        style={{ color: isActive ? item.color : "rgba(150,150,170,0.7)" }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] font-medium truncate transition-colors duration-200"
                    style={{ color: isActive ? item.color : "rgba(130,130,150,0.8)" }}>
                    {item.label.split(" ")[0]}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all active:scale-90 min-w-0"
          >
            <div className="relative flex items-center justify-center">
              {isMoreActive && !drawerOpen && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-gray-500/20"
                  transition={{ type: "spring", damping: 22, stiffness: 350 }}
                />
              )}
              <div className={`relative p-2 rounded-xl transition-all duration-200 ${drawerOpen ? "bg-white/10" : ""}`}>
                <LayoutGrid
                  className="h-5 w-5 transition-colors duration-200"
                  style={{ color: isMoreActive ? "rgba(200,200,220,0.9)" : "rgba(130,130,150,0.7)" }}
                />
              </div>
            </div>
            <span className="text-[9px] font-medium text-gray-500 transition-colors duration-200"
              style={{ color: isMoreActive ? "rgba(200,200,220,0.9)" : "rgba(130,130,150,0.7)" }}>
              Plus
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
