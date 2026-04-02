import { motion, AnimatePresence } from "motion/react";

export default function SplashApple({ visible }: { visible: boolean }) {
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
            {/* Apple-style logo — clean white apple silhouette repurposed as N */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.2, 0.64, 1] }}
              className="flex flex-col items-center gap-0"
            >
              {/* Abstract N with apple-style clean lines */}
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                  d="M18 58 L18 14 L36 42 L54 14 L54 58"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              <p
                className="text-white text-xl font-semibold tracking-tight select-none"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.02em" }}
              >
                Nexus Panel
              </p>

              {/* Progress bar Apple-style */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="rounded-full overflow-hidden"
                style={{ width: 160, height: 3, background: "rgba(255,255,255,0.15)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "rgba(255,255,255,0.85)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
