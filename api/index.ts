import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "../server/routes/auth.js";
import spotifyRoutes from "../server/routes/spotify.js";
import discordRoutes from "../server/routes/discord.js";
import databaseRoutes from "../server/routes/database.js";
import logsRoutes from "../server/routes/logs.js";
import analyticsRoutes from "../server/routes/analytics.js";
import aiRoutes from "../server/routes/ai.js";

const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

app.get("/api/config", (_req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
  });
});

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

export default app;
