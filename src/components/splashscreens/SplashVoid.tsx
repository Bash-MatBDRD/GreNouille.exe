import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() > 0.92 ? 2.5 : Math.random() > 0.7 ? 1.5 : 1,
  dur: 2 + Math.random() * 4,
  delay: Math.random() * 5,
}));

const RINGS = [120, 200, 300, 420];

export default function SplashVoid({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    setTimeout(() => setPhase(1), 300);
    setTimeout(() => setPhase(2), 1000);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#00000a" }}
        >
          {/* Stars being pulled inward */}
          {STARS.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%` }}
              animate={phase >= 1 ? {
                left: [`${s.x}%`, `${50 + (s.x - 50) * 0.3}%`],
                top: [`${s.y}%`, `${50 + (s.y - 50) * 0.3}%`],
                opacity: [s.size > 1.5 ? 0.9 : 0.4, 0.15],
                scale: [1, 0.3],
              } : { opacity: [0.2, s.size > 1.5 ? 0.9 : 0.4, 0.2] }}
              transition={phase >= 1
                ? { duration: 3.5, ease: "easeIn" }
                : { duration: s.dur, repeat: Infinity, delay: s.delay }
              }
            />
          ))}

          {/* Accretion disk rings */}
          {RINGS.map((r, i) => (
            <motion.div key={r} className="absolute pointer-events-none"
              style={{
                width: r,
                height: r,
                borderRadius: "50%",
                border: `${0.5 + i * 0.3}px solid rgba(${80 - i * 15},${40 + i * 10},${180 + i * 20},${0.35 - i * 0.05})`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 ${8 + i * 6}px rgba(60,30,160,0.2)`,
              }}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={phase >= 1 ? { opacity: [0, 0.7, 0.4], scale: [1.3, 1] } : {}}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* Rotating accretion glow */}
          <motion.div className="absolute pointer-events-none"
            style={{
              width: 280, height: 60,
              left: "50%", top: "50%",
              marginLeft: -140, marginTop: -30,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(80,40,200,0.35) 0%, rgba(120,60,255,0.1) 50%, transparent 80%)",
              filter: "blur(12px)",
            }}
            animate={phase >= 1 ? { rotate: 360 } : {}}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Black hole core */}
          <motion.div className="absolute pointer-events-none"
            style={{
              width: 90, height: 90,
              left: "50%", top: "50%",
              marginLeft: -45, marginTop: -45,
              borderRadius: "50%",
              background: "radial-gradient(circle, #000000 55%, rgba(30,5,80,0.8) 75%, transparent 100%)",
              boxShadow: "0 0 30px rgba(60,20,140,0.7), 0 0 80px rgba(40,10,100,0.4), 0 0 120px rgba(20,5,60,0.2)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Event horizon shimmer */}
          <motion.div className="absolute pointer-events-none"
            style={{
              width: 96, height: 96,
              left: "50%", top: "50%",
              marginLeft: -48, marginTop: -48,
              borderRadius: "50%",
              border: "1px solid rgba(120,60,255,0.5)",
            }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.97, 1.03, 0.97] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* NEXUS title */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                className="absolute z-10 flex flex-col items-center gap-3"
                style={{ bottom: "28%" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="text-6xl font-black tracking-[0.25em] select-none"
                  style={{
                    fontFamily: "'Arial Black', sans-serif",
                    background: "linear-gradient(180deg, #c8b0ff 0%, #7040cc 60%, #3010a0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.25em",
                  }}
                  animate={{ filter: [
                    "drop-shadow(0 0 10px rgba(100,50,200,0.5))",
                    "drop-shadow(0 0 22px rgba(130,70,255,0.8))",
                    "drop-shadow(0 0 10px rgba(100,50,200,0.5))",
                  ]}}
                  transition={{ duration: 3, repeat: Infinity }}
                >NEXUS</motion.h1>
                <motion.span className="text-[9px] tracking-[0.6em] uppercase font-mono"
                  style={{ color: "rgba(160,120,255,0.6)", textShadow: "0 0 8px rgba(100,60,200,0.5)" }}
                  animate={{ opacity: [0.45, 0.85, 0.45] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >◈ control panel ◈</motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
