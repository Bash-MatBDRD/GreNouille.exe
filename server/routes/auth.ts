import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import { logSystemEvent } from "./logs.js";
import { v4 as uuidv4 } from "uuid";

export { authenticateToken } from "../middleware/auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/logout", authenticateToken, (req: any, res) => {
  if (req.user) {
    logSystemEvent("info", `User logged out: ${req.user.username}`);
  }
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(sessionId);
  }
  res.json({ message: "Logged out" });
});

router.get("/me", authenticateToken, (req: any, res) => {
  const stmt = db.prepare(
    "SELECT id, username, email, discordId, twoFactorEnabled, spotifyAccessToken, avatarUrl FROM users WHERE id = ?"
  );
  const user = stmt.get(req.user.id) as any;
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: { ...user, hasSpotify: !!user.spotifyAccessToken } });
});

router.post("/session/record", authenticateToken, (req: any, res) => {
  try {
    const sessionId = uuidv4();
    db.prepare(
      "INSERT INTO sessions (userId, token, deviceInfo, ipAddress) VALUES (?, ?, ?, ?)"
    ).run(
      req.user.id,
      sessionId,
      req.headers["user-agent"] || "Unknown Device",
      req.ip || "Unknown IP"
    );
    logSystemEvent("info", `User logged in: ${req.user.username}`);
    res.json({ success: true, sessionId });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to record session" });
  }
});

router.post("/2fa/setup", authenticateToken, (req: any, res) => {
  try {
    db.prepare("UPDATE users SET twoFactorEnabled = 1 WHERE id = ?").run(req.user.id);
    logSystemEvent("success", `User ${req.user.username} enabled Email 2FA`);
    res.json({ success: true, message: "2FA enabled successfully" });
  } catch (error: any) {
    logSystemEvent("error", `Failed to setup 2FA for ${req.user.username}: ${error.message}`);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
});

router.post("/2fa/disable", authenticateToken, (req: any, res) => {
  try {
    db.prepare("UPDATE users SET twoFactorEnabled = 0 WHERE id = ?").run(req.user.id);
    logSystemEvent("info", `User ${req.user.username} disabled Email 2FA`);
    res.json({ success: true, message: "2FA disabled successfully" });
  } catch (error: any) {
    logSystemEvent("error", `Failed to disable 2FA for ${req.user.username}: ${error.message}`);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
});

router.get("/sessions", authenticateToken, (req: any, res) => {
  try {
    const dbSessions = db.prepare(
      "SELECT * FROM sessions WHERE userId = ? ORDER BY lastActive DESC LIMIT 10"
    ).all(req.user.id);

    const sessions = dbSessions.map((s: any) => ({
      id: s.id,
      device: s.deviceInfo,
      location: s.ipAddress,
      time: new Date(s.lastActive).toLocaleString(),
      current: false,
    }));

    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions/:id/revoke", authenticateToken, (req: any, res) => {
  try {
    const sessionId = req.params.id;
    const result = db.prepare("DELETE FROM sessions WHERE id = ? AND userId = ?").run(sessionId, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: "Session not found" });
    logSystemEvent("info", `User ${req.user.username} revoked a session`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to revoke session" });
  }
});

router.patch("/profile", authenticateToken, async (req: any, res) => {
  try {
    const { username, email, discordId } = req.body;
    if (!username && !email && discordId === undefined) return res.status(400).json({ error: "Nothing to update" });

    const fields: string[] = [];
    const values: any[] = [];

    if (username) { fields.push("username = ?"); values.push(username.trim()); }
    if (email) { fields.push("email = ?"); values.push(email.trim().toLowerCase()); }
    if (discordId !== undefined) { fields.push("discordId = ?"); values.push(discordId.trim()); }

    values.push(req.user.id);
    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);

    const updated = db.prepare("SELECT id, username, email, discordId, twoFactorEnabled, spotifyAccessToken, avatarUrl FROM users WHERE id = ?").get(req.user.id) as any;
    logSystemEvent("info", `User ${req.user.username} updated profile`);
    res.json({ user: { ...updated, hasSpotify: !!updated.spotifyAccessToken } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.patch("/avatar", authenticateToken, async (req: any, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== "string") return res.status(400).json({ error: "Avatar data required" });
    if (!avatar.startsWith("data:image/")) return res.status(400).json({ error: "Invalid image format" });
    if (avatar.length > 3 * 1024 * 1024) return res.status(400).json({ error: "Image too large (max 2MB)" });

    db.prepare("UPDATE users SET avatarUrl = ? WHERE id = ?").run(avatar, req.user.id);
    logSystemEvent("info", `User ${req.user.username} updated avatar`);
    res.json({ success: true, avatarUrl: avatar });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

router.patch("/password", authenticateToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords required" });
    if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const user = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);
    logSystemEvent("info", `User ${req.user.username} changed password`);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

router.get("/discord/status", authenticateToken, (_req, res) => {
  const configured = !!(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CHANNEL_ID);
  res.json({ configured });
});

export default router;
