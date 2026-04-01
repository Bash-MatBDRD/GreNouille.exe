import express from "express";
import { createServer as createHttpServer } from "http";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./server/routes/auth.js";
import spotifyRoutes from "./server/routes/spotify.js";
import discordRoutes from "./server/routes/discord.js";
import databaseRoutes from "./server/routes/database.js";
import logsRoutes from "./server/routes/logs.js";
import analyticsRoutes from "./server/routes/analytics.js";
import aiRoutes from "./server/routes/ai.js";
import { initDiscordGateway } from "./server/discord-gateway.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));
  app.use(cookieParser());

  // Expose safe public config to the frontend (never expose server secrets here)
  app.get("/api/config", (_req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/spotify", spotifyRoutes);
  app.use("/api/discord", discordRoutes);
  app.use("/api/database", databaseRoutes);
  app.use("/api/logs", logsRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/ai", aiRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createHttpServer(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Init Discord Gateway (non-blocking)
  initDiscordGateway().catch((err) => console.error("Discord gateway init error:", err));
}

startServer();
