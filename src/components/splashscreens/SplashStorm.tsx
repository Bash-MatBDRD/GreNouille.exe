import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BOLTS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: 15 + i * 13,
  delay: i * 0.22,
}));

function LightningBolt({ x, delay, bright }: { x: number; delay: number; bright: boolean }) {
  const points = [
    [x, 0],
    [x - 3, 22],
    [x + 4, 22],
    [x - 5, 50],
    [x + 6, 50],
    [x - 2, 80],
    [x + 3, 95],
  ];
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={bright ? "#e8f0ff" : "#7090ff"}
      strokeWidth={bright ? 1.5 : 0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={bright ? "url(#glow)" : undefined}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 0.8, 0] }}
      transition={{ duration: 0.35, delay, repeat: Infinity, repeatDelay: 2.5 + Math.random() * 2 }}
    />
  );
}

export default function SplashStorm({ visible }: { visible: boolean }) {
  const [flash, setFlash] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    setTimeout(() => setTitleVisible(true), 600);
    const triggerFlash = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
      setTimeout(triggerFlash, 2500 + Math.random() * 3000);
    };
    setTimeout(triggerFlash, 800);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: flash ? "#0d1530" : "#060810" }}
        >
          {/* Storm cloud texture */}
          <div className="absolute inset-0 pointer-events-none opacity-40"
            style={{ background: "radial-gradient(ellipse 120% 40% at 50% 0%, rgba(30,50,120,0.8) 0%, transparent 60%)" }}
          />

          {/* Ambient electric glow */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(80,120,255,0.08) 0%, transparent 70%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Flash overlay */}
          <AnimatePresence>
            {flash && (
              <motion.div key="flash" className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{ background: "rgba(180,210,255,0.18)" }}
              />
            )}
          </AnimatePresence>

          {/* Lightning SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 100 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {BOLTS.map((b) => (
              <LightningBolt key={b.id} x={b.x} delay={b.delay} bright={b.id % 2 === 0} />
            ))}
          </svg>

          {/* Horizontal electric arcs */}
          {[35, 55, 70].map((y, i) => (
            <motion.div key={i} className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: `${y}%`, height: 1,
                background: "linear-gradient(90deg, transparent 5%, rgba(100,160,255,0.6) 30%, rgba(180,220,255,0.9) 50%, rgba(100,160,255,0.6) 70%, transparent 95%)",
                filter: "blur(0.5px)",
              }}
              animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.8 + i * 0.7, delay: i * 0.4 }}
            />
          ))}

          {/* Rain */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div key={`rain-${i}`} className="absolute pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: -10,
                width: 1,
                height: 10 + Math.random() * 14,
                background: "linear-gradient(180deg, transparent, rgba(130,170,255,0.5))",
              }}
              animate={{ y: ["0vh", "110vh"] }}
              transition={{
                duration: 0.6 + Math.random() * 0.4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear",
              }}
            />
          ))}

          {/* Title */}
          <AnimatePresence>
            {titleVisible && (
              <motion.div
                className="relative z-10 flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="text-7xl font-black tracking-widest select-none"
                  style={{
                    fontFamily: "'Arial Black', sans-serif",
                    color: "#d0e8ff",
                    letterSpacing: "0.2em",
                    textShadow: "0 0 20px rgba(100,160,255,0.9), 0 0 60px rgba(80,120,255,0.5)",
                  }}
                  animate={{ textShadow: [
                    "0 0 15px rgba(100,160,255,0.7), 0 0 40px rgba(80,120,255,0.4)",
                    "0 0 30px rgba(160,200,255,1), 0 0 80px rgba(100,160,255,0.7)",
                    "0 0 15px rgba(100,160,255,0.7), 0 0 40px rgba(80,120,255,0.4)",
                  ]}}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >NEXUS</motion.h1>

                <div className="flex items-center gap-3">
                  <div className="h-px w-14" style={{ background: "linear-gradient(90deg, transparent, rgba(120,180,255,0.7))" }} />
                  <motion.span className="text-[9px] tracking-[0.6em] uppercase font-mono"
                    style={{ color: "rgba(160,200,255,0.7)", textShadow: "0 0 6px rgba(100,160,255,0.5)" }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >⚡ control panel ⚡</motion.span>
                  <div className="h-px w-14" style={{ background: "linear-gradient(90deg, rgba(120,180,255,0.7), transparent)" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(6,8,16,0.9) 100%)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
