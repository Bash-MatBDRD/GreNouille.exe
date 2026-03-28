import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const LETTERS = ["N", "E", "X", "U", "S"];

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600);
    }, 2600);
    return () => clearTimeout(exitTimer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020505] overflow-hidden"
        >
          {/* Animated grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(57,255,20,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Scanline effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#39FF14] to-transparent opacity-60"
            animate={{ y: ["-100vh", "100vh"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
          />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(57,255,20,0.08),transparent)]" />

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-10">
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center">
              {[80, 56, 36].map((size, i) => (
                <motion.div
                  key={size}
                  className="absolute rounded-full border border-[#39FF14]"
                  style={{ width: size, height: size }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3 - i * 0.08, 0.6 - i * 0.1, 0.3 - i * 0.08],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }}
                />
              ))}

              {/* Outer spinning ring */}
              <motion.div
                className="absolute h-24 w-24 rounded-full border-t-2 border-r-2 border-[#39FF14]/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute h-20 w-20 rounded-full border-b-2 border-l-2 border-[#39FF14]/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* Center terminal icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex h-10 w-10 items-center justify-center"
              >
                <span className="font-mono text-2xl font-bold text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,1)] select-none">
                  &gt;_
                </span>
              </motion.div>
            </div>

            {/* NEXUS title — staggered letters */}
            <div className="flex gap-2">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={letter + i}
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: 0.4 + i * 0.08,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#39FF14] drop-shadow-[0_0_20px_rgba(57,255,20,0.9)] select-none"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-xs tracking-[0.4em] uppercase text-[#39FF14] font-mono"
            >
              Dashboard Control System
            </motion.p>

            {/* Progress bar */}
            <motion.div className="h-px w-64 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#39FF14]/40 via-[#39FF14] to-[#00FF00] shadow-[0_0_10px_rgba(57,255,20,1)]"
              />
            </motion.div>
          </div>

          {/* Corner decorations */}
          {[
            "top-6 left-6 border-t-2 border-l-2",
            "top-6 right-6 border-t-2 border-r-2",
            "bottom-6 left-6 border-b-2 border-l-2",
            "bottom-6 right-6 border-b-2 border-r-2",
          ].map((classes, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className={`absolute h-8 w-8 border-[#39FF14]/40 ${classes}`}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
