import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BOOT_STEPS = [
  "BIOS v2.1.4 — Nexus Systems Corp.",
  "RAM Check: 16384 MB OK",
  "Loading NEXUS.SYS...",
  "Initializing display driver...",
  "NET: 192.168.1.1 connected",
  "NEXUS PANEL READY.",
];

export default function SplashRetro({ visible }: { visible: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;

    BOOT_STEPS.forEach((step, i) => {
      setTimeout(() => setLines(prev => [...prev, step]), i * 380);
    });

    const cursorIv = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(cursorIv);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-start justify-start overflow-hidden p-8 md:p-16"
          style={{ background: "#0a0a0a" }}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
          }} />

          {/* CRT glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,255,60,0.03) 0%, transparent 70%)",
          }} />

          <div className="relative z-10 flex flex-col gap-1 font-mono">
            {lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-sm"
                style={{
                  color: i === lines.length - 1 && line === "NEXUS PANEL READY."
                    ? "#00ff3c"
                    : "rgba(0,220,50,0.75)",
                  textShadow: "0 0 6px rgba(0,255,60,0.5)",
                }}
              >
                {line}
              </motion.p>
            ))}
            {lines.length < BOOT_STEPS.length && (
              <span className="text-sm" style={{ color: "rgba(0,220,50,0.75)" }}>
                {cursor ? "█" : " "}
              </span>
            )}
            {lines.length === BOOT_STEPS.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 flex flex-col gap-1"
              >
                <p className="text-3xl font-bold tracking-widest" style={{ color: "#00ff3c", textShadow: "0 0 20px rgba(0,255,60,0.6)" }}>
                  NEXUS
                </p>
                <p className="text-xs tracking-widest" style={{ color: "rgba(0,220,50,0.5)" }}>
                  CONTROL PANEL v4.2.1
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
