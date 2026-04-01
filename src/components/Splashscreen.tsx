import SplashNexus from "./splashscreens/SplashNexus";
import SplashiOS from "./splashscreens/SplashiOS";
import SplashWindows from "./splashscreens/SplashWindows";
import SplashMinimal from "./splashscreens/SplashMinimal";
import SplashMatrix from "./splashscreens/SplashMatrix";
import { useEffect, useState } from "react";

export type SplashTheme = "nexus" | "ios" | "windows" | "minimal" | "matrix";
export const SPLASH_KEY = "nexus-splash-theme";
export const SPLASH_ENABLED_KEY = "nexus-splash-enabled";

export default function Splashscreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const theme = (localStorage.getItem(SPLASH_KEY) as SplashTheme) || "nexus";
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

  const props = { visible };
  switch (theme) {
    case "ios": return <SplashiOS {...props} />;
    case "windows": return <SplashWindows {...props} />;
    case "minimal": return <SplashMinimal {...props} />;
    case "matrix": return <SplashMatrix {...props} />;
    default: return <SplashNexus {...props} />;
  }
}
