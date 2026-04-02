import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "> NEXUS OS v4.2.1 — BOOT SEQUENCE",
  "> Chargement des modules système...",
  "> AUTH_MODULE.......... [OK]",
  "> NET_INTERFACE......... [OK]",
  "> SENSOR_ARRAY......... [OK]",
  "> AI_CORE.............. [OK]",
  "> Accès autorisé — Bienvenue.",
];

export default function SplashHUD({ visible }: { visible: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);
  const hasRun = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;

    let angle = 0;
    const animateRadar = () => {
      angle = (angle + 1.8) % 360;
      setRadarAngle(angle);
      rafRef.current = requestAnimationFrame(animateRadar);
    };
    rafRef.current = requestAnimationFrame(animateRadar);

    BOOT_LINES.forEach((_, i) => {
      setTimeout(() => setVisibleLines(i + 1), 200 + i * 280);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  const rad = (radarAngle * Math.PI) / 180;
  const cx = 60, cy = 60, r = 50;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#000d08" }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(0,255,120,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,120,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          <div className="relative flex items-center gap-16">
            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Circles */}
                {[50, 37, 24, 11].map((rad, i) => (
                  <circle key={i} cx={cx} cy={cy} r={rad} fill="none" stroke="rgba(0,255,120,0.2)" strokeWidth="1" />
                ))}
                {/* Cross hairs */}
                <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />
                <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(0,255,120,0.15)" strokeWidth="1" />

                {/* Sweep */}
                <defs>
                  <radialGradient id="sweepGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                    gradientTransform={`translate(${cx} ${cy}) rotate(${radarAngle}) scale(${r})`}>
                    <stop offset="0%" stopColor="rgba(0,255,120,0)" />
                    <stop offset="60%" stopColor="rgba(0,255,120,0.35)" />
                    <stop offset="100%" stopColor="rgba(0,255,120,0.05)" />
                  </radialGradient>
                </defs>
                <path
                  d={`M ${cx} ${cy} L ${cx + r * Math.cos(rad - Math.PI * 0.6)} ${cy + r * Math.sin(rad - Math.PI * 0.6)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)} Z`}
                  fill="url(#sweepGrad)"
                />
                {/* Sweep line */}
                <line
                  x1={cx} y1={cy}
                  x2={cx + r * Math.cos(rad)}
                  y2={cy + r * Math.sin(rad)}
                  stroke="rgba(0,255,120,0.9)"
                  strokeWidth="1.5"
                />

                {/* Blips */}
                <circle cx="75" cy="38" r="2" fill="#00ff78" opacity="0.8">
                </circle>
                <circle cx="42" cy="72" r="1.5" fill="#00ff78" opacity="0.6" />
              </svg>
            </motion.div>

            {/* Boot log */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col gap-1"
              style={{ minWidth: 280 }}
            >
              {BOOT_LINES.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={i < visibleLines ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] font-mono"
                  style={{
                    color: i === visibleLines - 1
                      ? "#00ff78"
                      : line.includes("[OK]")
                      ? "rgba(0,255,120,0.6)"
                      : "rgba(0,200,90,0.45)",
                    textShadow: i === visibleLines - 1 ? "0 0 8px rgba(0,255,120,0.8)" : "none",
                  }}
                >
                  {line}
                </motion.p>
              ))}
              {visibleLines < BOOT_LINES.length && (
                <motion.span
                  className="text-[11px] font-mono"
                  style={{ color: "#00ff78" }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  _
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 text-[9px] font-mono" style={{ color: "rgba(0,255,120,0.4)" }}>NEXUS-HUD v4.2</div>
          <div className="absolute top-4 right-4 text-[9px] font-mono" style={{ color: "rgba(0,255,120,0.4)" }}>SYS OK</div>
          <div className="absolute bottom-4 left-4 text-[9px] font-mono" style={{ color: "rgba(0,255,120,0.4)" }}>LAT: 48.8566°N</div>
          <div className="absolute bottom-4 right-4 text-[9px] font-mono" style={{ color: "rgba(0,255,120,0.4)" }}>FREQ: 2.4GHz</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
