import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashNetflix({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"dark" | "beams" | "flash" | "logo">("dark");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t1 = setTimeout(() => setPhase("beams"), 200);
    const t2 = setTimeout(() => setPhase("flash"), 900);
    const t3 = setTimeout(() => setPhase("logo"), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Phase beams — converging vertical light columns */}
          <AnimatePresence>
            {(phase === "beams" || phase === "flash") && (
              <motion.div
                key="beams"
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {[
                  { from: "0%", to: "44%", delay: 0, w: 3 },
                  { from: "100%", to: "56%", delay: 0.05, w: 3 },
                  { from: "15%", to: "44%", delay: 0.1, w: 2 },
                  { from: "85%", to: "56%", delay: 0.1, w: 2 },
                  { from: "30%", to: "45%", delay: 0.15, w: 1.5 },
                  { from: "70%", to: "55%", delay: 0.15, w: 1.5 },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-0 bottom-0"
                    style={{ width: b.w, background: `linear-gradient(to bottom, transparent 0%, #E50914 30%, #ff2200 70%, transparent 100%)`, filter: "blur(1px)", boxShadow: `0 0 8px #E50914` }}
                    initial={{ left: b.from, opacity: 0 }}
                    animate={{ left: b.to, opacity: [0, 1, 1] }}
                    transition={{ delay: b.delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}

                {/* Central growing glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 200, height: 400, background: "radial-gradient(ellipse, rgba(229,9,20,0.25) 0%, transparent 70%)", filter: "blur(20px)" }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash */}
          <AnimatePresence>
            {phase === "flash" && (
              <motion.div
                key="flash"
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 40% 60% at 50% 50%, rgba(229,9,20,0.9) 0%, rgba(229,9,20,0.3) 40%, transparent 70%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.25 }}
              />
            )}
          </AnimatePresence>

          {/* Logo phase */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center gap-5"
              >
                {/* Outer glow halo */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(229,9,20,0.45) 0%, transparent 65%)", filter: "blur(40px)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.9, 0.5], scale: [0.5, 1.4, 1] }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* N logo */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originY: "center" }}
                >
                  <svg width="110" height="148" viewBox="0 0 110 148" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="nfxBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2a2a" />
                        <stop offset="50%" stopColor="#E50914" />
                        <stop offset="100%" stopColor="#7a0007" />
                      </linearGradient>
                      <linearGradient id="nfxShine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="45%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="55%" stopColor="rgba(255,255,255,0.35)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                      <filter id="nfxGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    <polygon
                      points="3,0 28,0 55,78 82,0 107,0 107,148 82,148 82,70 55,148 28,70 28,148 3,148"
                      fill="url(#nfxBase)"
                      filter="url(#nfxGlow)"
                    />
                    <polygon
                      points="3,0 28,0 55,78 82,0 107,0 107,148 82,148 82,70 55,148 28,70 28,148 3,148"
                      fill="url(#nfxShine)"
                    />
                  </svg>
                </motion.div>

                {/* Shine sweep */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{ top: 0, bottom: 0, width: 50, background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)" }}
                  initial={{ x: -150, opacity: 0 }}
                  animate={{ x: 150, opacity: [0, 1, 0] }}
                  transition={{ delay: 0.25, duration: 0.45, ease: "easeInOut" }}
                />

                {/* Bottom light pool */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{ bottom: -16, left: "50%", transform: "translateX(-50%)", width: 140, height: 18, background: "radial-gradient(ellipse, rgba(229,9,20,1) 0%, transparent 70%)", filter: "blur(8px)" }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.7, 0], scaleX: 1 }}
                  transition={{ delay: 0.1, duration: 0.7 }}
                />

                {/* NEXUS label */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-xs tracking-[0.55em] uppercase font-medium"
                  style={{ color: "rgba(255,80,80,0.8)", letterSpacing: "0.55em" }}
                >
                  NEXUS
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
