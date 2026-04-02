import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SCAN_LINES = 18;

export default function SplashCyberpunk({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"glitch" | "logo">("glitch");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setPhase("logo"), 800);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(16px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#02000a" }}
        >
          {/* Animated scan lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {Array.from({ length: SCAN_LINES }, (_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0"
                style={{
                  top: `${(i / SCAN_LINES) * 100}%`,
                  height: 1,
                  background: i % 2 === 0
                    ? "rgba(0,255,240,0.06)"
                    : "rgba(255,0,200,0.04)",
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2 + i * 0.1, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
          </div>

          {/* Neon corner brackets */}
          {[
            { top: 20, left: 20, rotate: 0 },
            { top: 20, right: 20, rotate: 90 },
            { bottom: 20, right: 20, rotate: 180 },
            { bottom: 20, left: 20, rotate: 270 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12"
              style={{ ...pos as any }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ transform: `rotate(${pos.rotate}deg)` }}>
                <path d="M4 24 L4 4 L24 4" stroke="#00f0ff" strokeWidth="2" fill="none" />
              </svg>
            </motion.div>
          ))}

          {/* Glitch lines */}
          <AnimatePresence>
            {phase === "glitch" && (
              <motion.div key="glitch" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0"
                    style={{
                      top: `${10 + i * 14}%`,
                      height: `${2 + Math.random() * 6}px`,
                      background: i % 2 === 0
                        ? "linear-gradient(90deg, transparent, rgba(0,255,240,0.6), rgba(255,0,200,0.4), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(255,0,200,0.5), rgba(0,255,240,0.3), transparent)",
                    }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 0.3 + i * 0.07, repeat: Infinity, delay: i * 0.12, ease: "linear" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center gap-5"
                style={{ zIndex: 2 }}
              >
                {/* Glitch N */}
                <div className="relative">
                  <motion.span
                    className="absolute text-8xl font-black select-none"
                    style={{ color: "#ff00cc", top: 0, left: 2, opacity: 0.7, fontFamily: "monospace" }}
                    animate={{ x: [-2, 2, -1, 0], opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 1.5 }}
                  >N</motion.span>
                  <motion.span
                    className="absolute text-8xl font-black select-none"
                    style={{ color: "#00f0ff", top: 0, left: -2, opacity: 0.7, fontFamily: "monospace" }}
                    animate={{ x: [2, -2, 1, 0], opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 1.5, delay: 0.05 }}
                  >N</motion.span>
                  <span
                    className="relative text-8xl font-black select-none"
                    style={{
                      color: "#ffffff",
                      textShadow: "0 0 20px #00f0ff, 0 0 50px rgba(0,240,255,0.4), -2px 0 #ff00cc, 2px 0 #00f0ff",
                      fontFamily: "monospace",
                    }}
                  >N</span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, #00f0ff)" }} />
                    <span className="text-xs tracking-[0.5em] font-mono" style={{ color: "#00f0ff" }}>NEXUS</span>
                    <div className="h-px w-10" style={{ background: "linear-gradient(90deg, #ff00cc, transparent)" }} />
                  </div>
                  <motion.span
                    className="text-[9px] font-mono tracking-widest"
                    style={{ color: "rgba(255,0,204,0.7)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    SYS_INIT OK
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(2,0,10,0.85) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
