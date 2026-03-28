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
    "SELECT id, username, email, discordId, twoFactorEnabled, spotifyAccessToken FROM users WHERE id = ?"
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
    const stmt = db.prepare(
      "SELECT * FROM sessions WHERE userId = ? ORDER BY lastActive DESC"
    );
    const dbSessions = stmt.all(req.user.id);

    const sessions = dbSessions.map((s: any) => ({
      id: s.id,
      device: s.deviceInfo,
      location: s.ipAddress,
      time: new Date(s.lastActive).toLocaleString(),
      current: false,
    }));

    res.json({ sessions });
  } catch (error: any) {
    logSystemEvent("error", `Failed to fetch sessions for ${req.user.username}: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions/:id/revoke", authenticateToken, (req: any, res) => {
  try {
    const sessionId = req.params.id;
    const stmt = db.prepare("DELETE FROM sessions WHERE id = ? AND userId = ?");
    const result = stmt.run(sessionId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    logSystemEvent("info", `User ${req.user.username} revoked a session`);
    res.json({ success: true, message: "Session revoked successfully" });
  } catch (error: any) {
    logSystemEvent("error", `Failed to revoke session for ${req.user.username}: ${error.message}`);
    res.status(500).json({ error: "Failed to revoke session" });
  }
});

export default router;
