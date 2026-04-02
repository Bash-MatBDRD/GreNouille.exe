import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

export default function SplashApple({ visible }: { visible: boolean }) {
  const [showBar, setShowBar] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setShowBar(true), 700);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000000" }}
        >
          <div className="flex flex-col items-center gap-14">
            {/* Clean N drawn with Apple-style precision */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.34, 1.15, 0.64, 1] }}
            >
              <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
                {/* Proper N: left bar down, diagonal top-left→bottom-right, right bar down */}
                <motion.line
                  x1="12" y1="12" x2="12" y2="68"
                  stroke="white" strokeWidth="6" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 }}
                />
                <motion.line
                  x1="12" y1="12" x2="60" y2="68"
                  stroke="white" strokeWidth="6" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                />
                <motion.line
                  x1="60" y1="12" x2="60" y2="68"
                  stroke="white" strokeWidth="6" strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-5"
            >
              <p
                className="text-white text-xl font-semibold select-none"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  letterSpacing: "-0.025em",
                }}
              >
                Nexus Panel
              </p>

              <AnimatePresence>
                {showBar && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-full overflow-hidden"
                    style={{ width: 176, height: 3.5, background: "rgba(255,255,255,0.13)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "rgba(255,255,255,0.88)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
