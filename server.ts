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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/spotify", spotifyRoutes);
  app.use("/api/discord", discordRoutes);
  app.use("/api/database", databaseRoutes);
  app.use("/api/logs", logsRoutes);
  app.use("/api/analytics", analyticsRoutes);

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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
