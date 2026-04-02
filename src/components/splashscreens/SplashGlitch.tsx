import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const GLITCH_COLORS = ["#ff003c", "#00f0ff", "#ffffff"];

export default function SplashGlitch({ visible }: { visible: boolean }) {
  const [glitching, setGlitching] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setGlitching(false), 1400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#080008" }}
        >
          {/* Horizontal glitch bands */}
          {glitching && Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0"
              style={{
                top: `${5 + i * 12}%`,
                height: `${3 + (i % 3) * 4}px`,
                background: `linear-gradient(90deg, transparent 0%, ${GLITCH_COLORS[i % 3]}80 30%, ${GLITCH_COLORS[(i + 1) % 3]}60 60%, transparent 100%)`,
                mixBlendMode: "screen",
              }}
              animate={{
                x: ["-60%", "60%", "-30%", "80%", "-10%"],
                opacity: [0, 0.9, 0, 0.7, 0],
                scaleX: [1, 1.3, 0.7, 1.1, 1],
              }}
              transition={{
                duration: 0.18 + i * 0.04,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "linear",
              }}
            />
          ))}

          {/* Main NEXUS text with glitch layers */}
          <div className="relative select-none">
            {/* Red channel */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={glitching ? {
                x: [-4, 3, -2, 5, 0, -3, 4, -1, 0],
                opacity: [0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6],
              } : { x: 0, opacity: 0 }}
              transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-8xl font-black tracking-widest" style={{ color: "#ff003c", mixBlendMode: "screen" }}>
                NEXUS
              </span>
            </motion.div>

            {/* Cyan channel */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={glitching ? {
                x: [3, -4, 2, -5, 0, 4, -2, 3, 0],
                opacity: [0.6, 0.4, 0.9, 0.3, 0.7, 0.5, 0.8, 0.4, 0.6],
              } : { x: 0, opacity: 0 }}
              transition={{ duration: 0.15, repeat: Infinity, ease: "linear", delay: 0.02 }}
            >
              <span className="text-8xl font-black tracking-widest" style={{ color: "#00f0ff", mixBlendMode: "screen" }}>
                NEXUS
              </span>
            </motion.div>

            {/* Main white text */}
            <motion.span
              className="relative text-8xl font-black tracking-widest"
              style={{ color: "#ffffff" }}
              animate={glitching ? {
                x: [0, -2, 1, -3, 0, 2, -1, 0],
                skewX: [0, -2, 0, 2, 0],
              } : { x: 0, skewX: 0 }}
              transition={{ duration: 0.18, repeat: glitching ? Infinity : 0, ease: "linear" }}
            >
              NEXUS
            </motion.span>
          </div>

          {/* Settled state — clean version */}
          <AnimatePresence>
            {!glitching && (
              <motion.div
                key="settled"
                className="absolute flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className="text-8xl font-black tracking-widest"
                  style={{ color: "#ffffff", textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                >
                  NEXUS
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-px w-36 origin-center"
                  style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }}
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs tracking-[0.6em] text-white uppercase"
                >
                  control panel
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, rgba(8,0,8,0.8) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
