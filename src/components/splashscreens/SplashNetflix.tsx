import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STREAK_COUNT = 60;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Streak {
  x: number;
  color: string;
  width: number;
  delay: number;
  duration: number;
  height: number;
  opacity: number;
}

const COLORS = [
  "#E50914", "#ff2200", "#ff6600", "#ff9900",
  "#cc0000", "#990000", "#ff4444", "#ff0033",
  "#ff3300", "#cc3300",
];

function generateStreaks(): Streak[] {
  return Array.from({ length: STREAK_COUNT }, (_, i) => ({
    x: (i / STREAK_COUNT) * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: randomBetween(1, 4),
    delay: randomBetween(0, 0.6),
    duration: randomBetween(0.4, 0.9),
    height: randomBetween(40, 100),
    opacity: randomBetween(0.4, 1),
  }));
}

export default function SplashNetflix({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"streaks" | "logo" | "done">("streaks");
  const [streaks] = useState<Streak[]>(() => generateStreaks());
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;

    const t1 = setTimeout(() => setPhase("logo"), 900);
    const t2 = setTimeout(() => setPhase("done"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Phase 1 — vertical light streaks */}
          <AnimatePresence>
            {phase === "streaks" && (
              <motion.div
                key="streaks"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                {streaks.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: s.opacity }}
                    transition={{
                      delay: s.delay,
                      duration: s.duration,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      position: "absolute",
                      left: `${s.x}%`,
                      top: 0,
                      bottom: 0,
                      width: s.width,
                      background: `linear-gradient(to bottom, transparent 0%, ${s.color} 20%, ${s.color} 80%, transparent 100%)`,
                      filter: `blur(${s.width > 2.5 ? 1.5 : 0.5}px)`,
                      transformOrigin: "top",
                      boxShadow: `0 0 ${s.width * 4}px ${s.color}`,
                    }}
                  />
                ))}

                {/* Center flash */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.18, 0] }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(229,9,20,0.35) 0%, transparent 70%)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2 — N logo */}
          <AnimatePresence>
            {(phase === "logo" || phase === "done") && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center"
              >
                {/* Outer glow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.7, 0.4], scale: [0.6, 1.8, 1.3] }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 280,
                    height: 280,
                    background: "radial-gradient(circle, rgba(229,9,20,0.6) 0%, transparent 65%)",
                    filter: "blur(28px)",
                  }}
                />

                {/* N SVG with vertical streak effect */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originY: "50%" }}
                >
                  <svg
                    width="130"
                    height="175"
                    viewBox="0 0 130 175"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="nBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff1a1a" />
                        <stop offset="50%" stopColor="#E50914" />
                        <stop offset="100%" stopColor="#8b0000" />
                      </linearGradient>
                      <linearGradient id="nShine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="40%" stopColor="rgba(255,255,255,0.18)" />
                        <stop offset="55%" stopColor="rgba(255,255,255,0.38)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                      <filter id="streakGlow" x="-30%" y="-10%" width="160%" height="120%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <clipPath id="nClip">
                        <polygon points="4,0 32,0 65,90 98,0 126,0 126,175 98,175 98,85 65,175 32,85 32,175 4,175" />
                      </clipPath>
                    </defs>

                    {/* Main N shape */}
                    <polygon
                      points="4,0 32,0 65,90 98,0 126,0 126,175 98,175 98,85 65,175 32,85 32,175 4,175"
                      fill="url(#nBase)"
                      filter="url(#streakGlow)"
                    />

                    {/* Vertical light streaks inside the N (clipped) */}
                    {[10, 20, 30, 42, 55, 68, 80, 90, 100, 112, 120].map((xPos, idx) => (
                      <rect
                        key={idx}
                        x={xPos}
                        y={0}
                        width={idx % 3 === 0 ? 2.5 : 1}
                        height={175}
                        fill={`rgba(255,${80 + idx * 10},${idx * 8},${0.15 + (idx % 2) * 0.12})`}
                        clipPath="url(#nClip)"
                      />
                    ))}

                    {/* Shine overlay */}
                    <polygon
                      points="4,0 32,0 65,90 98,0 126,0 126,175 98,175 98,85 65,175 32,85 32,175 4,175"
                      fill="url(#nShine)"
                    />
                  </svg>
                </motion.div>

                {/* Horizontal shine sweep */}
                <motion.div
                  initial={{ x: -180, opacity: 0 }}
                  animate={{ x: 180, opacity: [0, 0.8, 0] }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                  className="absolute pointer-events-none"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: 60,
                    background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.45) 50%, transparent 80%)",
                  }}
                />

                {/* Bottom light leak */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.6, 0], scaleX: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="absolute pointer-events-none"
                  style={{
                    bottom: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 160,
                    height: 20,
                    background: "radial-gradient(ellipse, rgba(229,9,20,0.9) 0%, transparent 70%)",
                    filter: "blur(6px)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
