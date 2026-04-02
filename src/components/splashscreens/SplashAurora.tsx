import { motion, AnimatePresence } from "motion/react";

const ORBS = [
  { color: "#00c8ff", x: "20%", y: "30%", w: 500, h: 300, delay: 0, dur: 7 },
  { color: "#7c3aed", x: "60%", y: "20%", w: 400, h: 350, delay: 1, dur: 9 },
  { color: "#06b6d4", x: "40%", y: "60%", w: 450, h: 280, delay: 0.5, dur: 8 },
  { color: "#a855f7", x: "70%", y: "55%", w: 380, h: 320, delay: 1.5, dur: 10 },
  { color: "#10b981", x: "10%", y: "65%", w: 360, h: 260, delay: 0.8, dur: 6 },
];

export default function SplashAurora({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: "blur(20px)" }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "#02030d" }}
        >
          {/* Aurora orbs */}
          {ORBS.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.w,
                height: orb.h,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(ellipse, ${orb.color}30 0%, transparent 65%)`,
                filter: "blur(40px)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: [0, 0.8, 0.5, 0.9, 0.6],
                scale: [0.6, 1.1, 0.95, 1.2, 1],
                x: [0, 30, -20, 15, 0],
                y: [0, -20, 15, -10, 0],
              }}
              transition={{
                delay: orb.delay,
                duration: orb.dur,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Subtle star field */}
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: Math.random() > 0.8 ? 2 : 1,
                height: Math.random() > 0.8 ? 2 : 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: "white",
              }}
              animate={{ opacity: [0.1, 0.8, 0.1] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center gap-2"
            >
              <motion.h1
                className="text-7xl font-black tracking-tight select-none"
                style={{
                  background: "linear-gradient(135deg, #a5f3fc 0%, #818cf8 35%, #c084fc 65%, #34d399 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(168,85,247,0.4))",
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(168,85,247,0.3))",
                    "drop-shadow(0 0 40px rgba(6,182,212,0.5))",
                    "drop-shadow(0 0 20px rgba(168,85,247,0.3))",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                NEXUS
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="h-px w-40 origin-center"
                style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(6,182,212,0.6), transparent)" }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-xs tracking-[0.5em] uppercase"
                style={{ color: "rgba(165,243,252,0.8)" }}
              >
                Control Panel
              </motion.p>
            </motion.div>
          </div>

          {/* Top vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(2,3,13,0.7) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
