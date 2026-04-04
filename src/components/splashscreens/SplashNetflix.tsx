import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function SplashNetflix({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState<"video" | "logo" | "done">("video");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    setPhase("video");

    const vid = videoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.muted = false;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }

    const onEnded = () => setPhase("logo");
    vid.addEventListener("ended", onEnded);

    // Safety timeout: if video fails to load or play
    const timeout = setTimeout(() => setPhase("logo"), 6000);

    return () => {
      vid.removeEventListener("ended", onEnded);
      clearTimeout(timeout);
    };
  }, [visible]);

  useEffect(() => {
    if (phase === "logo") {
      const t = setTimeout(() => setPhase("done"), 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <AnimatePresence>
      {visible && phase !== "done" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Video layer */}
          <AnimatePresence>
            {phase === "video" && (
              <motion.div
                key="video"
                className="absolute inset-0"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="/netflix-intro.mp4"
                  playsInline
                  preload="auto"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo layer — shown after video */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                key="logo"
                className="relative flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Ambient glow */}
                <div className="absolute pointer-events-none" style={{
                  width: 280, height: 360,
                  background: "radial-gradient(ellipse, rgba(229,9,20,0.5) 0%, transparent 65%)",
                  filter: "blur(48px)",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                }} />

                {/* N logo */}
                <svg width="100" height="142" viewBox="0 0 100 142" fill="none">
                  <defs>
                    <linearGradient id="nfx-left" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2e2e" />
                      <stop offset="50%" stopColor="#E50914" />
                      <stop offset="100%" stopColor="#8a0009" />
                    </linearGradient>
                    <linearGradient id="nfx-diag" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E50914" />
                      <stop offset="100%" stopColor="#b00710" />
                    </linearGradient>
                    <filter id="nfx-glow">
                      <feGaussianBlur stdDeviation="2.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect x="2" y="0" width="25" height="142" fill="url(#nfx-left)" filter="url(#nfx-glow)" />
                  <rect x="73" y="0" width="25" height="142" fill="url(#nfx-left)" filter="url(#nfx-glow)" />
                  <polygon points="2,0 27,0 98,142 73,142" fill="url(#nfx-diag)" filter="url(#nfx-glow)" />
                </svg>

                <p className="text-xs tracking-[0.6em] uppercase font-medium" style={{ color: "rgba(255,60,60,0.75)" }}>
                  NEXUS
                </p>

                {/* Ground shadow */}
                <div className="absolute pointer-events-none" style={{
                  bottom: -20, left: "50%", transform: "translateX(-50%)",
                  width: 120, height: 16,
                  background: "radial-gradient(ellipse, rgba(229,9,20,0.9) 0%, transparent 70%)",
                  filter: "blur(6px)",
                }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)",
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
