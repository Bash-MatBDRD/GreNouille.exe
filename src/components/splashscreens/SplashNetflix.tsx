import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashNetflix({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"black" | "scan" | "logo" | "shine">("black");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t1 = setTimeout(() => setPhase("scan"),  300);
    const t2 = setTimeout(() => setPhase("logo"),  900);
    const t3 = setTimeout(() => setPhase("shine"), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#000" }}
        >
          {/* Cinematic letterbox bars */}
          <div className="absolute top-0 inset-x-0 h-[9vh] bg-black z-10" />
          <div className="absolute bottom-0 inset-x-0 h-[9vh] bg-black z-10" />

          {/* Deep red background glow */}
          <AnimatePresence>
            {(phase === "scan" || phase === "logo" || phase === "shine") && (
              <motion.div
                key="glow"
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(229,9,20,0.18) 0%, transparent 75%)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Horizontal scan line */}
          <AnimatePresence>
            {phase === "scan" && (
              <motion.div
                key="scan"
                className="absolute inset-x-0 h-px"
                style={{ background: "rgba(229,9,20,0.9)", boxShadow: "0 0 18px 4px rgba(229,9,20,0.6)" }}
                initial={{ top: "-2px", opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Main N Logo */}
          <AnimatePresence>
            {(phase === "logo" || phase === "shine") && (
              <motion.div
                key="logo"
                className="relative flex flex-col items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {/* Ambient glow behind logo */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 280, height: 360,
                    background: "radial-gradient(ellipse, rgba(229,9,20,0.5) 0%, transparent 65%)",
                    filter: "blur(48px)",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0.6], scale: [0.4, 1.3, 1] }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* The iconic N */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originY: "center" }}
                >
                  <svg width="100" height="142" viewBox="0 0 100 142" fill="none">
                    <defs>
                      <linearGradient id="nfx-left" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#ff2e2e" />
                        <stop offset="50%"  stopColor="#E50914" />
                        <stop offset="100%" stopColor="#8a0009" />
                      </linearGradient>
                      <linearGradient id="nfx-right" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#ff2e2e" />
                        <stop offset="50%"  stopColor="#E50914" />
                        <stop offset="100%" stopColor="#8a0009" />
                      </linearGradient>
                      <linearGradient id="nfx-diag" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%"   stopColor="#E50914" />
                        <stop offset="100%" stopColor="#b00710" />
                      </linearGradient>
                      <filter id="nfx-glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <linearGradient id="nfx-shine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
                        <stop offset="45%"  stopColor="rgba(255,255,255,0.12)" />
                        <stop offset="50%"  stopColor="rgba(255,255,255,0.28)" />
                        <stop offset="55%"  stopColor="rgba(255,255,255,0.12)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                    </defs>

                    {/* Left pillar */}
                    <rect x="2" y="0" width="25" height="142" fill="url(#nfx-left)" filter="url(#nfx-glow)" />
                    {/* Right pillar */}
                    <rect x="73" y="0" width="25" height="142" fill="url(#nfx-right)" filter="url(#nfx-glow)" />
                    {/* Diagonal stroke (N crossbar) */}
                    <polygon points="2,0 27,0 98,142 73,142" fill="url(#nfx-diag)" filter="url(#nfx-glow)" />

                    {/* Shine overlay */}
                    <rect x="2" y="0" width="96" height="142" fill="url(#nfx-shine)" />
                  </svg>
                </motion.div>

                {/* Shine sweep */}
                {phase === "shine" && (
                  <motion.div
                    className="absolute pointer-events-none"
                    style={{
                      top: 0, bottom: 0, width: 44,
                      background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)",
                    }}
                    initial={{ x: -120, opacity: 0 }}
                    animate={{ x: 180, opacity: [0, 1, 0] }}
                    transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
                  />
                )}

                {/* Ground shadow */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: -20, left: "50%", transform: "translateX(-50%)",
                    width: 120, height: 16,
                    background: "radial-gradient(ellipse, rgba(229,9,20,0.9) 0%, transparent 70%)",
                    filter: "blur(6px)",
                  }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.8, 0.4], scaleX: 1 }}
                  transition={{ delay: 0.15, duration: 0.8 }}
                />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xs tracking-[0.6em] uppercase font-medium"
                  style={{ color: "rgba(255,60,60,0.75)" }}
                >
                  NEXUS
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 30%, rgba(0,0,0,0.88) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
