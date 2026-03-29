import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const exit = setTimeout(() => setVisible(false), 3000);
    const done = setTimeout(onComplete, 3600);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(24px)" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#05050f" }}
        >
          {/* Background atmosphere */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 700,
              height: 700,
              top: -180,
              right: -120,
              background: "radial-gradient(circle, rgba(79,110,247,0.13) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 550,
              height: 550,
              bottom: -160,
              left: -100,
              background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 350,
              height: 350,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(79,110,247,0.07) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-9">

            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.55, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="relative w-24 h-24 rounded-[28px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(79,110,247,0.22) 0%, rgba(124,58,237,0.14) 100%)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  boxShadow:
                    "0 0 0 1px rgba(79,110,247,0.15), 0 0 40px rgba(79,110,247,0.28), 0 0 100px rgba(79,110,247,0.1), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                {/* Inner highlight */}
                <div
                  className="absolute inset-0 rounded-[28px]"
                  style={{
                    background: "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.18) 0%, transparent 55%)",
                  }}
                />
                {/* N */}
                <span
                  className="relative z-10 text-[2.6rem] font-black select-none leading-none"
                  style={{
                    color: "#ffffff",
                    textShadow:
                      "0 0 16px rgba(100,130,255,0.9), 0 0 40px rgba(79,110,247,0.5)",
                    letterSpacing: "-0.04em",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  N
                </span>
              </div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.38, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2.5"
            >
              <h1
                className="text-5xl font-black tracking-[0.22em] select-none"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, rgba(200,210,255,0.75) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                NEXUS
              </h1>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.68, duration: 0.5, ease: "easeOut" }}
                className="h-px w-24 origin-center"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(100,130,255,0.7), transparent)",
                }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.38 }}
                transition={{ delay: 0.82, duration: 0.5 }}
                className="text-[0.65rem] tracking-[0.48em] uppercase font-medium"
                style={{ color: "rgba(200,210,255,0.9)" }}
              >
                Control Panel
              </motion.p>
            </motion.div>

            {/* Windows-style shimmer loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="w-52 overflow-hidden rounded-full"
              style={{ height: 2, background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: "40%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(79,110,247,0.85), rgba(139,92,246,0.9), rgba(79,110,247,0.85), transparent)",
                }}
                animate={{ x: ["-100%", "350%"] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.3,
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
