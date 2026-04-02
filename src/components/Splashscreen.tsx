import SplashNexus from "./splashscreens/SplashNexus";
import SplashiOS from "./splashscreens/SplashiOS";
import SplashWindows from "./splashscreens/SplashWindows";
import SplashMinimal from "./splashscreens/SplashMinimal";
import SplashNetflix from "./splashscreens/SplashNetflix";
import SplashMatrix from "./splashscreens/SplashMatrix";
import SplashCyberpunk from "./splashscreens/SplashCyberpunk";
import SplashApple from "./splashscreens/SplashApple";
import SplashHUD from "./splashscreens/SplashHUD";
import SplashAurora from "./splashscreens/SplashAurora";
import SplashGlitch from "./splashscreens/SplashGlitch";
import SplashRetro from "./splashscreens/SplashRetro";
import { useEffect, useState } from "react";

export type SplashTheme =
  | "nexus"
  | "ios"
  | "windows"
  | "minimal"
  | "netflix"
  | "matrix"
  | "cyberpunk"
  | "apple"
  | "hud"
  | "aurora"
  | "glitch"
  | "retro";

export const SPLASH_KEY = "nexus-splash-theme";
export const SPLASH_ENABLED_KEY = "nexus-splash-enabled";

export function renderSplash(theme: SplashTheme, props: { visible: boolean }) {
  switch (theme) {
    case "ios": return <SplashiOS {...props} />;
    case "windows": return <SplashWindows {...props} />;
    case "minimal": return <SplashMinimal {...props} />;
    case "netflix": return <SplashNetflix {...props} />;
    case "matrix": return <SplashMatrix {...props} />;
    case "cyberpunk": return <SplashCyberpunk {...props} />;
    case "apple": return <SplashApple {...props} />;
    case "hud": return <SplashHUD {...props} />;
    case "aurora": return <SplashAurora {...props} />;
    case "glitch": return <SplashGlitch {...props} />;
    case "retro": return <SplashRetro {...props} />;
    default: return <SplashNexus {...props} />;
  }
}

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const rawTheme = localStorage.getItem(SPLASH_KEY) as SplashTheme;
  const theme: SplashTheme = rawTheme || "nexus";
  const enabled = localStorage.getItem(SPLASH_ENABLED_KEY) !== "false";

  useEffect(() => {
    if (!enabled) {
      onComplete();
      return;
    }
    const exit = setTimeout(() => setVisible(false), 3000);
    const done = setTimeout(onComplete, 3600);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onComplete, enabled]);

  if (!enabled) return null;

  return renderSplash(theme, { visible });
}
