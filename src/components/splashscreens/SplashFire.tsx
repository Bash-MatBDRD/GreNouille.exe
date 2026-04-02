import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EMBERS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: 20 + Math.random() * 60,
  delay: Math.random() * 3.0,
  duration: 1.6 + Math.random() * 2.8,
  size: 1.2 + Math.random() * 4.2,
  drift: (Math.random() - 0.5) * 100,
  color: Math.random() > 0.6 ? "#ffdd00" : Math.random() > 0.3 ? "#ff8c00" : "#ff4400",
}));

function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = 340);
    const H = (canvas.height = 220);
    const buf = new Uint8Array(W * H);

    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      const r = Math.min(255, i * 3);
      const g = Math.max(0, Math.min(255, i * 2.2 - 130));
      const b = i > 200 ? Math.min(255, (i - 200) * 5) : 0;
      palette.push([r, g, b]);
    }

    const draw = () => {
      for (let x = 0; x < W; x++) {
        const hot = Math.random() > 0.28;
        buf[(H - 1) * W + x] = hot ? 185 + Math.random() * 70 : Math.random() * 40;
      }
      for (let y = 0; y < H - 1; y++) {
        for (let x = 0; x < W; x++) {
          const s =
            buf[(y + 1) * W + ((x - 1 + W) % W)] +
            buf[(y + 1) * W + x] +
            buf[(y + 1) * W + ((x + 1) % W)] +
            buf[Math.min(H - 1, y + 2) * W + x];
          buf[y * W + x] = Math.max(0, Math.floor(s / 4) - 1);
        }
      }

      const img = ctx.createImageData(W, H);
      for (let i = 0; i < W * H; i++) {
        const c = palette[buf[i]];
        img.data[i * 4] = c[0];
        img.data[i * 4 + 1] = c[1];
        img.data[i * 4 + 2] = c[2];
        img.data[i * 4 + 3] = Math.min(255, buf[i] * 2.2);
      }
      ctx.putImageData(img, 0, 0);
    };

    const id = setInterval(draw, 35);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: "16%",
        left: "50%",
        transform: "translateX(-50%) scaleX(2.6) scaleY(1.6)",
        opacity: 0.9,
        imageRendering: "pixelated",
        width: 340,
        height: 220,
        mixBlendMode: "screen",
      }}
    />
  );
}

export default function SplashFire({ visible }: { visible: boolean }) {
  const [showText, setShowText] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!visible || hasRun.current) return;
    hasRun.current = true;
    const t = setTimeout(() => setShowText(true), 220);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 85%, #150200, #080100 60%, #000)" }}
        >
          {/* Animated fire base glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse 60% 42% at 50% 85%, rgba(255,55,0,0.42) 0%, rgba(160,15,0,0.14) 55%, transparent 74%)",
                "radial-gradient(ellipse 68% 50% at 50% 85%, rgba(255,100,0,0.58) 0%, rgba(210,30,0,0.22) 55%, transparent 74%)",
                "radial-gradient(ellipse 58% 40% at 50% 85%, rgba(255,55,0,0.42) 0%, rgba(160,15,0,0.14) 55%, transparent 74%)",
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary upper glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse 35% 28% at 50% 55%, rgba(255,130,0,0.16) 0%, transparent 65%)",
                "radial-gradient(ellipse 40% 34% at 50% 52%, rgba(255,200,0,0.22) 0%, transparent 65%)",
                "radial-gradient(ellipse 35% 28% at 50% 55%, rgba(255,130,0,0.16) 0%, transparent 65%)",
              ],
            }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />

          <FireCanvas />

          {/* Embers */}
          {EMBERS.map((e) => (
            <motion.div
              key={e.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: e.size,
                height: e.size,
                left: `${e.x}%`,
                bottom: "22%",
                background: e.color,
                boxShadow: `0 0 ${e.size * 3}px ${e.color}`,
              }}
              animate={{
                y: [0, -(110 + Math.random() * 180)],
                x: [0, e.drift],
                opacity: [0, 0.9, 0.7, 0],
                scale: [1, 0.6, 0.2, 0],
              }}
              transition={{
                duration: e.duration,
                repeat: Infinity,
                delay: e.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* NEXUS text */}
          <AnimatePresence>
            {showText && (
              <motion.div
                className="relative z-10 flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.75, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="text-8xl font-black tracking-wider select-none"
                  style={{
                    fontFamily: "'Arial Black', Impact, sans-serif",
                    background: "linear-gradient(180deg, #fff8c0 0%, #ffdd00 18%, #ff9500 48%, #cc2500 88%, #7a0000 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.08em",
                  }}
                  animate={{
                    filter: [
                      "drop-shadow(0 0 12px rgba(255,120,0,0.9)) drop-shadow(0 0 30px rgba(255,50,0,0.6))",
                      "drop-shadow(0 0 22px rgba(255,200,0,1)) drop-shadow(0 0 55px rgba(255,100,0,0.8))",
                      "drop-shadow(0 0 12px rgba(255,120,0,0.9)) drop-shadow(0 0 30px rgba(255,50,0,0.6))",
                    ],
                  }}
                  transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                >
                  NEXUS
                </motion.h1>

                <motion.p
                  className="text-[10px] tracking-[0.7em] uppercase"
                  style={{ color: "rgba(255,140,0,0.8)", fontFamily: "monospace" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  igniting...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smoke wisps at top */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 60 + i * 30,
                height: 60 + i * 30,
                left: `${35 + i * 12}%`,
                top: "8%",
                background: "rgba(60,30,10,0.18)",
                filter: "blur(18px)",
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 0.4, 0],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.7,
                repeat: Infinity,
                delay: i * 1.1,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
