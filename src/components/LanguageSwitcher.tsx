import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, toggle } = useLanguage();
  const isFR = lang === "FR";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="relative flex items-center rounded-full select-none cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
        padding: "3px",
        gap: 0,
      }}
    >
      <div
        className="absolute rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: "calc(50% - 3px)",
          height: "calc(100% - 6px)",
          top: "3px",
          left: "3px",
          background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 100%)",
          boxShadow: "0 0 12px rgba(79,110,247,0.5)",
          transform: isFR ? "translateX(0%)" : "translateX(100%)",
        }}
      />
      {(["FR", "EN"] as const).map((l) => (
        <span
          key={l}
          className="relative z-10 px-3 py-1 text-xs font-bold transition-colors duration-300"
          style={{
            color: lang === l ? "#ffffff" : "rgba(255,255,255,0.35)",
            minWidth: "36px",
            textAlign: "center",
          }}
        >
          {l}
        </span>
      ))}
    </button>
  );
}
