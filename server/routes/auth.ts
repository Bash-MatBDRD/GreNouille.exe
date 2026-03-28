import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { logSystemEvent } from "./logs.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export { authenticateToken } from "../middleware/auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";
const TWO_FACTOR_SECRET = process.env.TWO_FACTOR_SECRET || "2fa_secret_key";

// Configure nodemailer with Ethereal (fake SMTP for testing)
// In production, replace with real SMTP credentials
let transporter: nodemailer.Transporter;
nodemailer.createTestAccount().then((account) => {
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    );
    const info = stmt.run(username, email, hashedPassword);

    const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const sessionId = uuidv4();
    db.prepare("INSERT INTO sessions (userId, token, deviceInfo, ipAddress) VALUES (?, ?, ?, ?)").run(
      info.lastInsertRowid,
      sessionId,
      req.headers['user-agent'] || 'Unknown Device',
      req.ip || 'Unknown IP'
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    logSystemEvent("success", `New user registered: ${username} (${email})`);

    res.json({ message: "User created successfully", user: { id: info.lastInsertRowid, username, email } });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      logSystemEvent("warning", `Failed registration attempt for existing email/username: ${email}`);
      return res.status(400).json({ error: "Username or email already exists" });
    }
    logSystemEvent("error", `Database error during signup: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as any;

    if (!user) {
      logSystemEvent("warning", `Failed login attempt for email: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logSystemEvent("warning", `Failed login attempt (wrong password) for user: ${user.username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
      
      db.prepare("INSERT INTO two_factor_codes (userId, code, expiresAt) VALUES (?, ?, ?)").run(user.id, code, expiresAt);

      // Send code via Email
      if (transporter) {
        try {
          const info = await transporter.sendMail({
            from: '"Nexus Security" <security@nexus.app>',
            to: user.email,
            subject: "Your 2FA Login Code",
            text: `Your Nexus Dashboard login code is: ${code}\nThis code will expire in 5 minutes.`,
            html: `<b>Your Nexus Dashboard login code is: ${code}</b><br>This code will expire in 5 minutes.`,
          });
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (err) {
          console.error("Failed to send 2FA email:", err);
        }
      }

      // Return a temporary token for 2FA verification
      const tempToken = jwt.sign({ id: user.id, username: user.username, pending2FA: true }, TWO_FACTOR_SECRET, {
        expiresIn: "5m",
      });

      return res.json({ 
        requires2FA: true, 
        tempToken,
        message: "2FA code sent to your email" 
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const sessionId = uuidv4();
    db.prepare("INSERT INTO sessions (userId, token, deviceInfo, ipAddress) VALUES (?, ?, ?, ?)").run(
      user.id,
      sessionId,
      req.headers['user-agent'] || 'Unknown Device',
      req.ip || 'Unknown IP'
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    logSystemEvent("info", `User logged in: ${user.username}`);

    res.json({ message: "Logged in successfully", user: { id: user.id, username: user.username, email: user.email } });
  } catch (error: any) {
    logSystemEvent("error", `Database error during login: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { tempToken, code } = req.body;
  
  if (!tempToken || !code) {
    return res.status(400).json({ error: "Token and code required" });
  }

  try {
    const decoded = jwt.verify(tempToken, TWO_FACTOR_SECRET) as any;
    const userId = decoded.id;

    const stmt = db.prepare("SELECT * FROM two_factor_codes WHERE userId = ? ORDER BY id DESC LIMIT 1");
    const storedCodeData = stmt.get(userId) as any;
    
    if (!storedCodeData) {
      return res.status(400).json({ error: "No pending 2FA request" });
    }

    if (new Date() > new Date(storedCodeData.expiresAt)) {
      db.prepare("DELETE FROM two_factor_codes WHERE id = ?").run(storedCodeData.id);
      return res.status(400).json({ error: "Code expired" });
    }

    if (storedCodeData.code !== code) {
      logSystemEvent("warning", `Failed 2FA attempt for user ID: ${userId}`);
      return res.status(400).json({ error: "Invalid code" });
    }

    // Code is valid
    db.prepare("DELETE FROM two_factor_codes WHERE userId = ?").run(userId);

    const userStmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = userStmt.get(userId) as any;

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const sessionId = uuidv4();
    db.prepare("INSERT INTO sessions (userId, token, deviceInfo, ipAddress) VALUES (?, ?, ?, ?)").run(
      user.id,
      sessionId,
      req.headers['user-agent'] || 'Unknown Device',
      req.ip || 'Unknown IP'
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    logSystemEvent("info", `User logged in with 2FA: ${user.username}`);

    res.json({ message: "Logged in successfully", user: { id: user.id, username: user.username, email: user.email } });

  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

router.post("/logout", authenticateToken, (req: any, res) => {
  if (req.user) {
    logSystemEvent("info", `User logged out: ${req.user.username}`);
  }
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(sessionId);
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out" });
});

router.get("/me", authenticateToken, (req: any, res) => {
  const stmt = db.prepare("SELECT id, username, email, discordId, twoFactorEnabled, spotifyAccessToken FROM users WHERE id = ?");
  const user = stmt.get(req.user.id) as any;
  if (!user) return res.status(404).json({ error: "User not found" });
  
  res.json({ user: { ...user, hasSpotify: !!user.spotifyAccessToken } });
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
    const stmt = db.prepare("SELECT * FROM sessions WHERE userId = ? ORDER BY lastActive DESC");
    const dbSessions = stmt.all(req.user.id);
    
    const currentSessionId = req.cookies.sessionId;
    
    const sessions = dbSessions.map((s: any) => ({
      id: s.id,
      device: s.deviceInfo,
      location: s.ipAddress,
      time: new Date(s.lastActive).toLocaleString(),
      current: s.token === currentSessionId
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

router.post("/forgot-password", async (req: any, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as any;

    if (user) {
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
      
      db.prepare("INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

      if (transporter) {
        try {
          const resetLink = `\${req.protocol}://\${req.get('host')}/reset-password?token=\${token}`;
          const info = await transporter.sendMail({
            from: '"Nexus Security" <security@nexus.app>',
            to: user.email,
            subject: "Password Reset Request",
            text: `Click here to reset your password: \${resetLink}\nThis link expires in 15 minutes.`,
            html: `<b>Click <a href="\${resetLink}">here</a> to reset your password.</b><br>This link expires in 15 minutes.`,
          });
          console.log("Password Reset Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (err) {
          console.error("Failed to send reset email:", err);
        }
      }
    }
    
    // Always return success to prevent email enumeration
    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    logSystemEvent("error", `Forgot password error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req: any, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required" });

  try {
    const stmt = db.prepare("SELECT * FROM password_resets WHERE token = ?");
    const resetRequest = stmt.get(token) as any;

    if (!resetRequest) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date() > new Date(resetRequest.expiresAt)) {
      db.prepare("DELETE FROM password_resets WHERE id = ?").run(resetRequest.id);
      return res.status(400).json({ error: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, resetRequest.userId);
    db.prepare("DELETE FROM password_resets WHERE userId = ?").run(resetRequest.userId);
    
    // Invalidate all sessions
    db.prepare("DELETE FROM sessions WHERE userId = ?").run(resetRequest.userId);

    logSystemEvent("info", `Password reset for user ID: ${resetRequest.userId}`);
    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    logSystemEvent("error", `Reset password error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
