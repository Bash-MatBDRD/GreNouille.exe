import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Music, MessageSquare, LogOut, Settings, User, ActivitySquare, ChevronLeft, ChevronRight, Shield, Database, Terminal } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isCollapsed = !isPinned && !isHovered;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/spotify", icon: Music, label: "Spotify Player" },
    { to: "/discord", icon: MessageSquare, label: "Discord Bot" },
    { to: "/analytics", icon: ActivitySquare, label: "Analytics" },
    { to: "/security", icon: Shield, label: "Security" },
    { to: "/database", icon: Database, label: "Database" },
    { to: "/logs", icon: Terminal, label: "System Logs" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div 
      style={{ width: isCollapsed ? 80 : 256 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-screen flex-col border-r border-white/10 bg-[#050505] p-4 z-50 transition-[width] duration-200 ease-in-out"
    >
      <button
        onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-white hover:bg-white/20 transition-colors duration-200"
      >
        {isPinned ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div className={`mb-12 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 mt-4`}>
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

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-indigo-300"
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="relative z-10 h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className={`group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400`}
        title={isCollapsed ? "Logout" : undefined}
      >
        <LogOut className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'group-hover:-translate-x-1'}`} />
        {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
      </button>
    </div>
  );
}
