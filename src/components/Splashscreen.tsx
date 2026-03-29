import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const exit = setTimeout(() => setVisible(false), 2800);
    const done = setTimeout(onComplete, 3400);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(24px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030308] overflow-hidden"
        >
          {/* Ambient background glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 700,
              height: 700,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Soft floating orbs */}
          {[
            { dx: -220, dy: -160, size: 280, dur: 5, delay: 0 },
            { dx: 200, dy: 80, size: 200, dur: 6, delay: 0.8 },
            { dx: -60, dy: 190, size: 160, dur: 7, delay: 0.4 },
          ].map((o, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: o.size,
                height: o.size,
                left: `calc(50% + ${o.dx}px)`,
                top: `calc(50% + ${o.dy}px)`,
                background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)",
              }}
              animate={{ x: [0, 18, 0], y: [0, -12, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Content */}
          <div className="relative flex flex-col items-center gap-8">

            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Glow halo */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: "0 0 50px rgba(57,255,20,0.22), 0 0 100px rgba(57,255,20,0.08)" }}
              />

              {/* Card */}
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(57,255,20,0.14) 0%, rgba(0,200,0,0.04) 100%)",
                  border: "1px solid rgba(57,255,20,0.28)",
                }}
              >
                {/* Slow rotating inner border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute rounded-xl opacity-25"
                  style={{ inset: 8, border: "1px solid rgba(57,255,20,0.7)" }}
                />

                {/* N monogram */}
                <span
                  className="relative z-10 text-[2rem] font-black select-none leading-none"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 20%, #39FF14 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 14px rgba(57,255,20,0.9))",
                    letterSpacing: "-0.03em",
                  }}
                >
                  N
                </span>
              </div>
            </motion.div>

            {/* NEXUS wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.38, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <h1
                className="text-5xl font-black tracking-[0.18em] select-none"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                NEXUS
              </h1>

              {/* Divider line reveal */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
                className="h-px w-28 origin-center"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(57,255,20,0.75), transparent)",
                }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                className="text-[0.65rem] tracking-[0.45em] uppercase text-white font-medium"
              >
                Control Panel
              </motion.p>
            </motion.div>

            {/* Animated dot loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === 1 || i === 2 ? 5 : 3,
                    height: i === 1 || i === 2 ? 5 : 3,
                    background: "rgba(57,255,20,0.7)",
                  }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
