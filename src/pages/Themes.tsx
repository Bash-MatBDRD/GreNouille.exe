import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Paintbrush, Check, Eye, ChevronDown, ChevronUp, Sparkles, X, Palette, Type, Shapes, Layers } from "lucide-react";
import { type SplashTheme, renderSplash } from "../components/splashscreens/renderSplash";
import { SPLASH_KEY, SPLASH_ENABLED_KEY } from "../components/Splashscreen";
import {
  logoColors, loadLogoStyle, saveLogoStyle,
  getLetterStyle, getContainerShape, useLogoColor, useLogoStyle,
} from "../components/Sidebar";
import type { LogoStyle } from "../components/Sidebar";

const SETTINGS_KEY = "nexus-settings";

interface NexusSettings {
  animations: boolean;
  compactMode: boolean;
  showAvatarInSidebar: boolean;
}

const DEFAULT_SETTINGS: NexusSettings = { animations: true, compactMode: false, showAvatarInSidebar: true };

function loadSettings(): NexusSettings {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
  catch { return DEFAULT_SETTINGS; }
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${value ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "bg-gray-700"}`}
    >
      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

const FONT_OPTIONS: { id: LogoStyle["font"]; label: string; family: string }[] = [
  { id: "system", label: "Défaut", family: "system-ui, sans-serif" },
  { id: "serif", label: "Serif", family: "Georgia, serif" },
  { id: "mono", label: "Mono", family: "'Courier New', monospace" },
  { id: "impact", label: "Impact", family: "Impact, 'Arial Black', sans-serif" },
  { id: "italic", label: "Italic", family: "system-ui, sans-serif" },
  { id: "display", label: "Display", family: "'Trebuchet MS', Candara, sans-serif" },
];

const EFFECT_OPTIONS: { id: LogoStyle["effect"]; label: string; desc: string }[] = [
  { id: "glow", label: "Glow", desc: "Lueur subtile" },
  { id: "neon", label: "Néon", desc: "Néon intense" },
  { id: "gradient", label: "Gradient", desc: "Dégradé blanc" },
  { id: "outline", label: "Contour", desc: "Texte creux" },
  { id: "hologram", label: "Hologramme", desc: "Décalage chromatique" },
  { id: "plain", label: "Simple", desc: "Sans effet" },
];

const SHAPE_OPTIONS: { id: LogoStyle["shape"]; label: string }[] = [
  { id: "rounded", label: "Arrondi" },
  { id: "square", label: "Carré" },
  { id: "circle", label: "Cercle" },
];

const SPLASH_OPTIONS: { id: SplashTheme; label: string; description: string; preview: React.ReactNode }[] = [
  {
    id: "nexus",
    label: "Nexus",
    description: "Logo animé avec lueurs",
    preview: (
      <div className="w-full h-full bg-[#05050f] flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg, rgba(79,110,247,0.4), rgba(124,58,237,0.3))", boxShadow: "0 0 12px rgba(79,110,247,0.5)" }}>
            <span className="text-white font-black text-sm">N</span>
          </div>
          <span className="text-white text-[8px] font-black tracking-widest">NEXUS</span>
          <div className="w-10 h-0.5 rounded-full overflow-hidden bg-white/10">
            <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: "linear-gradient(90deg, transparent, #4F6EF7, transparent)" }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ios",
    label: "iOS",
    description: "Style démarrage iPhone",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(145deg, #1a1a2e, #0f3460)", boxShadow: "0 0 10px rgba(79,110,247,0.3)" }}>
            <span className="text-white font-black text-base">N</span>
          </div>
          <span className="text-white text-[9px] font-medium">Nexus Panel</span>
          <div className="flex gap-0.5">{[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/60" />)}</div>
        </div>
      </div>
    ),
  },
  {
    id: "windows",
    label: "Windows",
    description: "Style Windows 11",
    preview: (
      <div className="w-full h-full bg-[#050510] flex flex-col items-center justify-between py-3 rounded-xl">
        <div />
        <div className="flex flex-col items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5">
            {["#4F6EF7","#7C3AED","#6366F1","#8B5CF6"].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
          </div>
          <span className="text-white text-[8px] tracking-widest font-light">NEXUS</span>
        </div>
        <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60" />)}</div>
      </div>
    ),
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Texte épuré, lettre par lettre",
    preview: (
      <div className="w-full h-full bg-[#030303] flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-1">
          <span className="text-white text-xs font-thin tracking-[0.4em]">NEXUS</span>
          <div className="w-8 h-px bg-white/30" />
          <span className="text-white/30 text-[7px] tracking-widest">control panel</span>
        </div>
      </div>
    ),
  },
  {
    id: "netflix",
    label: "Netflix",
    description: "Intro rouge cinématique",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(229,9,20,0.2) 0%, transparent 70%)" }} />
        <div className="relative flex items-center justify-center">
          <div className="absolute w-14 h-14 rounded-full" style={{ background: "radial-gradient(circle, rgba(229,9,20,0.5) 0%, transparent 70%)", filter: "blur(8px)" }} />
          <svg width="22" height="30" viewBox="0 0 110 148" fill="none">
            <polygon points="3,0 28,0 55,78 82,0 107,0 107,148 82,148 82,70 55,148 28,70 28,148 3,148" fill="#E50914" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    id: "matrix",
    label: "Matrix",
    description: "Pluie de code japonais",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 flex gap-1 p-1 opacity-60">
          {Array.from({length: 8}, (_, col) => (
            <div key={col} className="flex flex-col gap-0.5" style={{ flex: 1 }}>
              {Array.from({length: 10}, (_, row) => (
                <div key={row} className="text-[5px] font-mono leading-none"
                  style={{ color: row === 2 ? "#88ffbb" : `rgba(0,${100+row*15},60,${0.8-row*0.07})` }}>
                  {["ア","イ","ウ","ネ","X","0","ス","1"][Math.abs(col-row)%8]}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="relative z-10 text-[10px] font-mono font-bold px-2 py-1 rounded" style={{ color: "#00ff66", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(0,255,102,0.3)", textShadow: "0 0 6px #00ff66" }}>NEXUS</div>
      </div>
    ),
  },
  {
    id: "void" as SplashTheme,
    label: "Void",
    description: "Trou noir cosmique",
    preview: (
      <div className="w-full h-full bg-[#00000a] flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(circle at 50% 50%, rgba(60,20,140,0.5) 0%, rgba(20,5,60,0.3) 40%, transparent 70%)" }} />
        {[40,60,80].map((r, i) => (
          <div key={r} className="absolute rounded-full" style={{ width: r, height: r, left: "50%", top: "50%", transform: "translate(-50%,-50%)", border: `${0.5 + i*0.3}px solid rgba(80,30,200,${0.4 - i*0.1})` }} />
        ))}
        <div className="absolute rounded-full" style={{ width: 18, height: 18, left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#000", boxShadow: "0 0 12px rgba(80,30,200,0.8)" }} />
        <span className="absolute font-black font-mono text-[8px] tracking-widest" style={{ bottom: "28%", color: "rgba(160,100,255,0.7)", textShadow: "0 0 6px rgba(100,40,200,0.6)" }}>NEXUS</span>
      </div>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    description: "Démarrage macOS épuré",
    preview: (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-3 rounded-xl">
        <svg width="22" height="22" viewBox="0 0 72 72" fill="none">
          <path d="M18 58 L18 14 L36 42 L54 14 L54 58" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="rounded-full overflow-hidden" style={{ width: 48, height: 2, background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full animate-pulse" style={{ width: "65%", background: "rgba(255,255,255,0.8)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "hud",
    label: "HUD",
    description: "Radar militaire & boot log",
    preview: (
      <div className="w-full h-full bg-[#000d08] flex items-center justify-center gap-3 rounded-xl overflow-hidden">
        <div style={{ width: 36, height: 36 }}>
          <svg width="36" height="36" viewBox="0 0 120 120">
            {[50,37,24].map((r, i) => <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="rgba(0,255,120,0.25)" strokeWidth="1" />)}
            <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />
            <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />
            <line x1="60" y1="60" x2="60" y2="10" stroke="rgba(0,255,120,0.8)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          {["AUTH... [OK]", "NET.... [OK]", "AI..... [OK]"].map((l, i) => (
            <span key={i} className="text-[6px] font-mono" style={{ color: "rgba(0,200,90,0.7)" }}>{l}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Aurores boréales animées",
    preview: (
      <div className="w-full h-full bg-[#02030d] flex items-center justify-center rounded-xl overflow-hidden relative">
        {[
          { c: "rgba(0,200,255,0.25)", l: "20%", t: "30%" },
          { c: "rgba(124,58,237,0.2)", l: "55%", t: "20%" },
          { c: "rgba(16,185,129,0.18)", l: "35%", t: "55%" },
        ].map((o, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 80, height: 60, left: o.l, top: o.t, transform: "translate(-50%,-50%)", background: `radial-gradient(ellipse, ${o.c} 0%, transparent 70%)`, filter: "blur(12px)" }} />
        ))}
        <span className="relative z-10 text-[10px] font-black tracking-widest" style={{ background: "linear-gradient(135deg, #a5f3fc, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</span>
      </div>
    ),
  },
  {
    id: "glitch",
    label: "Glitch",
    description: "Corruption numérique",
    preview: (
      <div className="w-full h-full bg-[#080008] flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="relative select-none">
          <span className="absolute text-base font-black" style={{ color: "#ff003c", left: 2, top: 0, opacity: 0.7 }}>NEXUS</span>
          <span className="absolute text-base font-black" style={{ color: "#00f0ff", left: -2, top: 0, opacity: 0.7 }}>NEXUS</span>
          <span className="text-base font-black" style={{ color: "#ffffff" }}>NEXUS</span>
        </div>
      </div>
    ),
  },
  {
    id: "retro",
    label: "Rétro",
    description: "Terminal DOS old school",
    preview: (
      <div className="w-full h-full bg-[#0a0a0a] flex items-start justify-start p-2 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-0.5 font-mono">
          {["BIOS v2.1.4 OK", "RAM: 16384MB OK", "> NEXUS.SYS..."].map((l, i) => (
            <span key={i} className="text-[6px]" style={{ color: "rgba(0,220,50,0.7)", textShadow: "0 0 4px rgba(0,255,60,0.4)" }}>{l}</span>
          ))}
          <span className="text-[8px] font-bold mt-1" style={{ color: "#00ff3c", textShadow: "0 0 8px rgba(0,255,60,0.6)" }}>NEXUS READY.</span>
        </div>
      </div>
    ),
  },
  {
    id: "tiktok" as SplashTheme,
    label: "TikTok",
    description: "Logo décalé R/G/B style TikTok",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden">
        <div className="relative select-none">
          <span className="absolute text-lg font-black" style={{ fontFamily: "'Arial Black', sans-serif", color: "#25F4EE", left: -3, top: 0, opacity: 0.85, mixBlendMode: "screen" }}>NEXUS</span>
          <span className="absolute text-lg font-black" style={{ fontFamily: "'Arial Black', sans-serif", color: "#FE2C55", left: 3, top: 0, opacity: 0.85, mixBlendMode: "screen" }}>NEXUS</span>
          <span className="text-lg font-black" style={{ fontFamily: "'Arial Black', sans-serif", color: "#ffffff" }}>NEXUS</span>
        </div>
      </div>
    ),
  },
  {
    id: "sakura" as SplashTheme,
    label: "Sakura",
    description: "Pétales de cerisier",
    preview: (
      <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden relative" style={{ background: "linear-gradient(180deg, #0a0010 0%, #1a0525 100%)" }}>
        <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,100,180,0.08) 0%, transparent 70%)" }} />
        {["✿","❀","✿","❀"].map((p, i) => (
          <span key={i} className="absolute text-[8px]" style={{ color: `rgba(255,${120+i*20},${180+i*10},0.7)`, left: `${15 + i*22}%`, top: `${20 + (i%2)*30}%` }}>{p}</span>
        ))}
        <div className="flex flex-col items-center gap-1 relative z-10">
          <span className="text-[11px] font-black tracking-widest" style={{ fontFamily: "'Arial Black'", background: "linear-gradient(180deg, #ffd6ee, #ff80c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "none", filter: "drop-shadow(0 0 4px rgba(255,100,180,0.6))" }}>NEXUS</span>
          <span className="text-[6px] tracking-widest font-mono" style={{ color: "rgba(255,180,220,0.6)" }}>✿ panel ✿</span>
        </div>
      </div>
    ),
  },
  {
    id: "storm" as SplashTheme,
    label: "Storm",
    description: "Tempête électrique",
    preview: (
      <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center" style={{ background: "#060810" }}>
        <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(ellipse 100% 40% at 50% 0%, rgba(30,50,120,0.7) 0%, transparent 60%)" }} />
        {[25,50,75].map((x, i) => (
          <div key={i} className="absolute" style={{ left: `${x}%`, top: 0, width: 1, height: `${40+i*15}%`, background: `linear-gradient(180deg, transparent, rgba(${100+i*30},${150+i*20},255,0.8), transparent)`, filter: "blur(0.5px)" }} />
        ))}
        <div className="h-px w-3/4 absolute" style={{ top: "55%", background: "linear-gradient(90deg, transparent, rgba(120,180,255,0.8), transparent)" }} />
        <span className="relative z-10 text-[11px] font-black tracking-widest" style={{ fontFamily: "'Arial Black'", color: "#c8e0ff", textShadow: "0 0 8px rgba(100,160,255,0.9)", marginTop: 20 }}>NEXUS</span>
      </div>
    ),
  },
  {
    id: "gold" as SplashTheme,
    label: "Or",
    description: "Luxe & élégance dorée",
    preview: (
      <div className="w-full h-full bg-[#0a0700] flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(145deg, #1a1300, #2a1f00)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 0 10px rgba(212,175,55,0.2)" }}>
            <span className="text-base font-black" style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(180deg, #f8e08e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>N</span>
          </div>
          <span className="text-[8px] tracking-widest font-black" style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(90deg, #d4af37, #f8e08e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NEXUS</span>
        </div>
      </div>
    ),
  },
  {
    id: "fire" as SplashTheme,
    label: "Feu",
    description: "Flammes & braises animées",
    preview: (
      <div className="w-full h-full bg-[#0a0100] flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(255,80,0,0.5) 0%, rgba(200,20,0,0.2) 50%, transparent 75%)", filter: "blur(8px)" }} />
        <span className="relative z-10 text-sm font-black" style={{ fontFamily: "'Arial Black'", background: "linear-gradient(180deg, #fff7aa, #ffcc00, #ff6600, #cc2200)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 6px rgba(255,100,0,0.8))" }}>NEXUS</span>
      </div>
    ),
  },
  {
    id: "ice" as SplashTheme,
    label: "Glace",
    description: "Cristaux de glace & froideur",
    preview: (
      <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center relative" style={{ background: "linear-gradient(180deg, #000a14, #001a2e)" }}>
        <div className="absolute bottom-0 left-0 right-0 h-8 flex justify-around items-end">
          {[30,48,24,40,28].map((h, i) => (
            <div key={i} className="w-2" style={{ height: h, background: "linear-gradient(180deg, rgba(150,230,255,0.15), rgba(100,200,255,0.08))", clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", border: "1px solid rgba(150,230,255,0.12)" }} />
          ))}
        </div>
        <span className="relative z-10 text-[10px] font-black tracking-widest" style={{ fontFamily: "'Georgia', serif", background: "linear-gradient(180deg, #e8f8ff, #60c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 6px rgba(100,200,255,0.6))" }}>NEXUS</span>
      </div>
    ),
  },
];

const INITIAL_VISIBLE = 6;

function SplashInner({ theme, visible }: { theme: SplashTheme; visible: boolean }) {
  return renderSplash(theme, { visible }) as React.ReactElement;
}

function SplashPreviewModal({ theme, onClose }: { theme: SplashTheme; onClose: () => void }) {
  const [previewKey, setPreviewKey] = useState(0);
  return (
    <div className="fixed inset-0 z-[90]">
      <SplashInner key={previewKey} theme={theme} visible={true} />
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        <button onClick={() => setPreviewKey(k => k + 1)}
          className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 text-xs text-white font-medium hover:bg-white/20 transition-all"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          Rejouer
        </button>
        <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Themes() {
  const logoColor = useLogoColor();
  const currentLogoStyle = useLogoStyle();
  const [logoStyle, setLogoStyle] = useState<LogoStyle>(loadLogoStyle);
  const [selectedColorId, setSelectedColorId] = useState(() => localStorage.getItem("nexus-logo-color") || "indigo");
  const [splashTheme, setSplashTheme] = useState<SplashTheme>(
    () => (localStorage.getItem(SPLASH_KEY) as SplashTheme) || "nexus"
  );
  const [splashEnabled, setSplashEnabled] = useState<boolean>(
    () => localStorage.getItem(SPLASH_ENABLED_KEY) !== "false"
  );
  const [settings, setSettings] = useState<NexusSettings>(loadSettings);
  const [showAll, setShowAll] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<SplashTheme | null>(null);
  const [saved, setSaved] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pickColor = (id: string) => {
    setSelectedColorId(id);
    localStorage.setItem("nexus-logo-color", id);
    window.dispatchEvent(new Event("nexus-logo-color-change"));
    flashSaved();
  };

  const updateLogoStyle = (partial: Partial<LogoStyle>) => {
    const next = { ...logoStyle, ...partial };
    setLogoStyle(next);
    saveLogoStyle(next);
    flashSaved();
  };

  const updateSplash = (theme: SplashTheme) => {
    setSplashTheme(theme);
    localStorage.setItem(SPLASH_KEY, theme);
    flashSaved();
  };

  const updateSplashEnabled = (enabled: boolean) => {
    setSplashEnabled(enabled);
    localStorage.setItem(SPLASH_ENABLED_KEY, enabled ? "true" : "false");
    flashSaved();
  };

  const updateSetting = (key: keyof NexusSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...stored, ...next }));
    flashSaved();
  };

  const previewColor = logoColors.find(c => c.id === selectedColorId) || logoColors[0];
  const letterCSS = getLetterStyle(previewColor, logoStyle);
  const shapeClass = getContainerShape(logoStyle);

  const visibleOptions = showAll ? SPLASH_OPTIONS : SPLASH_OPTIONS.slice(0, INITIAL_VISIBLE);

  return (
    <div className="flex-1 p-6 md:p-8">
      {previewTheme && <SplashPreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} />}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <Paintbrush className="h-10 w-10 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-purple-500">
                Thèmes & Design
              </span>
            </h1>
            <p className="mt-2 text-gray-400">Personnalisez l'apparence complète de votre panel.</p>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm text-violet-300"
              >
                <Check className="h-4 w-4" /> Sauvegardé
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="space-y-8">

        {/* Logo personnalisation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Palette className="h-6 w-6 text-violet-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Logo</h2>
            <span className="ml-auto text-xs text-gray-600 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">Aperçu en temps réel</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
            <div className="space-y-8">

              {/* Color picker */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" /> Couleur
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {logoColors.map((c) => (
                    <button key={c.id} onClick={() => pickColor(c.id)} title={c.label}
                      className="group relative h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 active:scale-95"
                      style={{ background: c.bg, border: `2px solid ${selectedColorId === c.id ? c.border : "rgba(255,255,255,0.06)"}`, boxShadow: selectedColorId === c.id ? `0 0 14px ${c.glow}` : "none" }}
                    >
                      {selectedColorId === c.id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {logoColors.map((c) => (
                    <span key={c.id} className="text-[9px] text-gray-600 text-center truncate">{c.label}</span>
                  ))}
                </div>
              </div>

              {/* Font picker */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-violet-400" /> Police de caractère
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {FONT_OPTIONS.map((f) => {
                    const fStyle = getLetterStyle(previewColor, { ...logoStyle, font: f.id });
                    return (
                      <button key={f.id} onClick={() => updateLogoStyle({ font: f.id })}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border-2 transition-all hover:scale-105 active:scale-95 ${logoStyle.font === f.id ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_16px_rgba(139,92,246,0.25)]" : "border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20"}`}
                      >
                        <div className={`h-10 w-10 ${shapeClass} flex items-center justify-center`}
                          style={{ background: previewColor.bg, border: `1px solid ${previewColor.border}`, boxShadow: `0 0 10px ${previewColor.glow}30` }}
                        >
                          <span style={{ ...fStyle, fontSize: 18 }} className="leading-none">N</span>
                        </div>
                        <span className={`text-xs font-medium ${logoStyle.font === f.id ? "text-violet-300" : "text-gray-500"}`}>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Effect picker */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-400" /> Effet visuel
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {EFFECT_OPTIONS.map((e) => {
                    const eStyle = getLetterStyle(previewColor, { ...logoStyle, effect: e.id });
                    return (
                      <button key={e.id} onClick={() => updateLogoStyle({ effect: e.id })}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border-2 transition-all hover:scale-105 active:scale-95 ${logoStyle.effect === e.id ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_16px_rgba(139,92,246,0.25)]" : "border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20"}`}
                      >
                        <div className={`h-10 w-10 ${shapeClass} flex items-center justify-center`}
                          style={{ background: previewColor.bg, border: `1px solid ${previewColor.border}`, boxShadow: `0 0 10px ${previewColor.glow}30` }}
                        >
                          <span style={{ ...eStyle, fontSize: 18 }} className="leading-none">N</span>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-medium ${logoStyle.effect === e.id ? "text-violet-300" : "text-gray-400"}`}>{e.label}</p>
                          <p className="text-[9px] text-gray-600 mt-0.5">{e.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shape picker */}
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Shapes className="h-4 w-4 text-violet-400" /> Forme du conteneur
                </p>
                <div className="flex gap-3">
                  {SHAPE_OPTIONS.map((s) => {
                    const shapePreview = getContainerShape({ ...logoStyle, shape: s.id });
                    return (
                      <button key={s.id} onClick={() => updateLogoStyle({ shape: s.id })}
                        className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-6 border-2 transition-all hover:scale-105 active:scale-95 ${logoStyle.shape === s.id ? "border-violet-500/60 bg-violet-500/10" : "border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20"}`}
                      >
                        <div className={`h-10 w-10 ${shapePreview} flex items-center justify-center`}
                          style={{ background: previewColor.bg, border: `1px solid ${previewColor.border}`, boxShadow: `0 0 10px ${previewColor.glow}30` }}
                        >
                          <span style={{ ...letterCSS, fontSize: 18 }} className="leading-none">N</span>
                        </div>
                        <span className={`text-xs font-medium ${logoStyle.shape === s.id ? "text-violet-300" : "text-gray-500"}`}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest">Aperçu</p>
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/3 border border-white/8 w-full">
                <div className={`h-16 w-16 ${shapeClass} flex items-center justify-center transition-all`}
                  style={{
                    background: `linear-gradient(145deg, ${previewColor.bg} 0%, rgba(0,0,0,0.1) 100%)`,
                    border: `1px solid ${previewColor.border}`,
                    boxShadow: `0 0 0 1px ${previewColor.bg}, 0 0 24px ${previewColor.glow}50, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                >
                  <span style={{ ...letterCSS, fontSize: 28 }} className="leading-none">N</span>
                </div>
                <h3 className="text-sm font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">NEXUS</h3>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-gray-600">Couleur: <span className="text-gray-400">{previewColor.label}</span></p>
                  <p className="text-[10px] text-gray-600">Police: <span className="text-gray-400">{FONT_OPTIONS.find(f => f.id === logoStyle.font)?.label}</span></p>
                  <p className="text-[10px] text-gray-600">Effet: <span className="text-gray-400">{EFFECT_OPTIONS.find(e => e.id === logoStyle.effect)?.label}</span></p>
                  <p className="text-[10px] text-gray-600">Forme: <span className="text-gray-400">{SHAPE_OPTIONS.find(s => s.id === logoStyle.shape)?.label}</span></p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Animation de démarrage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Sparkles className="h-6 w-6 text-indigo-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Animation de démarrage</h2>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-300 font-medium">Afficher l'animation de démarrage</p>
              <p className="text-sm text-gray-500 mt-0.5">Si désactivée, l'application s'ouvre directement.</p>
            </div>
            <Toggle value={splashEnabled} onChange={updateSplashEnabled} />
          </div>

          <div className={`transition-opacity duration-200 ${!splashEnabled ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <AnimatePresence initial={false}>
                {visibleOptions.map((opt) => (
                  <motion.div key={opt.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                    className={`group flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      splashTheme === opt.id ? "border-indigo-500 shadow-[0_0_20px_rgba(79,110,247,0.4)]" : "border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => updateSplash(opt.id)}
                  >
                    <div className="h-24 w-full relative">
                      {opt.preview}
                      {splashTheme === opt.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setPreviewTheme(opt.id); }}
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                        title="Prévisualiser"
                      >
                        <Eye className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                    <div className={`px-2.5 py-2 text-left ${splashTheme === opt.id ? "bg-indigo-500/10" : "bg-white/3"}`}>
                      <p className={`text-xs font-semibold ${splashTheme === opt.id ? "text-indigo-300" : "text-white"}`}>{opt.label}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-4">
              <button onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-gray-300 hover:bg-white/10 hover:border-white/25 transition-all duration-200"
              >
                {showAll ? <><ChevronUp className="h-4 w-4" /> Voir moins</> : <><ChevronDown className="h-4 w-4" /> Voir plus d'animations ({SPLASH_OPTIONS.length - INITIAL_VISIBLE} autres)</>}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Apparence */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Layers className="h-6 w-6 text-fuchsia-400 drop-shadow-[0_0_8px_currentColor]" />
            <h2 className="text-xl font-bold text-white">Apparence</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Animations de l'interface</span>
                <p className="text-xs text-gray-500 mt-0.5">Activer les transitions et effets animés</p>
              </div>
              <Toggle value={settings.animations} onChange={(v) => updateSetting("animations", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Mode compact</span>
                <p className="text-xs text-gray-500 mt-0.5">Réduire l'espacement des éléments</p>
              </div>
              <Toggle value={settings.compactMode} onChange={(v) => updateSetting("compactMode", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-300 font-medium">Avatar dans la barre latérale</span>
                <p className="text-xs text-gray-500 mt-0.5">Afficher votre photo de profil en bas du menu</p>
              </div>
              <Toggle value={settings.showAvatarInSidebar} onChange={(v) => updateSetting("showAvatarInSidebar", v)} />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
