import { motion } from "motion/react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#020505]">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,255,20,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative h-14 w-14">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#39FF14]/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#39FF14]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-[#39FF14]/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,1)] select-none">
              &gt;_
            </span>
          </div>
        </div>

        {/* NEXUS text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-sm tracking-[0.35em] text-[#39FF14] uppercase"
        >
          NEXUS
        </motion.p>

        <p className="text-xs text-gray-600 tracking-widest font-mono">
          Initializing...
        </p>
      </div>
    </div>
  );
}
