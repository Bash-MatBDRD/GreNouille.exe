import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const PETALS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: Math.random() * 110 - 5,
  size: 6 + Math.random() * 10,
  dur: 4 + Math.random() * 5,
  delay: Math.random() * 5,
  rotate: Math.random() * 360,
  drift: (Math.random() - 0.5) * 120,
  opacity: 0.55 + Math.random() * 0.45,
}));

export default function SplashSakura({ visible }: { visible: boolean }) {
  const [titleVisible, setTitleVisible] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    setTimeout(() => setTitleVisible(true), 700);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0a0010 0%, #1a0525 45%, #0d0018 100%)" }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,100,180,0.07) 0%, transparent 70%)" }}
          />

          {/* Falling petals */}
          {PETALS.map((p) => (
            <motion.div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: -20,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
              animate={{
                y: ["0vh", "110vh"],
                x: [0, p.drift],
                rotate: [p.rotate, p.rotate + 360],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear",
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="10" cy="13" rx="5" ry="8" fill="rgba(255,160,200,0.85)" transform="rotate(-30 10 10)" />
                <ellipse cx="10" cy="13" rx="5" ry="8" fill="rgba(255,190,220,0.55)" transform="rotate(30 10 10)" />
                <circle cx="10" cy="10" r="2" fill="rgba(255,220,240,0.9)" />
              </svg>
            </motion.div>
          ))}

          {/* Horizontal mist lines */}
          {[0.25, 0.55, 0.78].map((y, i) => (
            <motion.div key={i} className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: `${y * 100}%`,
                height: 1,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,150,200,0.15) 30%, rgba(255,150,200,0.25) 50%, rgba(255,150,200,0.15) 70%, transparent 100%)",
              }}
              animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 4 + i * 1.2, repeat: Infinity, delay: i * 0.8 }}
            />
          ))}

          {/* Title */}
          <AnimatePresence>
            {titleVisible && (
              <motion.div
                className="relative z-10 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="text-7xl font-black tracking-widest select-none"
                  style={{
                    fontFamily: "'Arial Black', sans-serif",
                    background: "linear-gradient(180deg, #ffd6ee 0%, #ff80c0 50%, #cc44aa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.22em",
                    filter: "drop-shadow(0 0 18px rgba(255,100,180,0.6))",
                  }}
                  animate={{ filter: [
                    "drop-shadow(0 0 14px rgba(255,100,180,0.5))",
                    "drop-shadow(0 0 28px rgba(255,100,180,0.8))",
                    "drop-shadow(0 0 14px rgba(255,100,180,0.5))",
                  ]}}
                  transition={{ duration: 3, repeat: Infinity }}
                >NEXUS</motion.h1>

                <div className="flex items-center gap-3">
                  <motion.div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,200,0.6))" }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                  />
                  <motion.span className="text-[9px] tracking-[0.55em] uppercase font-mono"
                    style={{ color: "rgba(255,180,220,0.75)", textShadow: "0 0 8px rgba(255,120,180,0.5)" }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >✿ control panel ✿</motion.span>
                  <motion.div className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(255,140,200,0.6), transparent)" }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(10,0,16,0.85) 100%)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
