import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import db from "../db.js";

const router = Router();

// Get recent logs
router.get("/", authenticateToken, (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT 50").all();
    res.json(logs);
  } catch (error) {
    console.error("Logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Helper function to insert logs internally
export function logSystemEvent(type: "info" | "warning" | "error" | "success", message: string) {
  try {
    db.prepare("INSERT INTO system_logs (type, message) VALUES (?, ?)").run(type, message);
  } catch (err) {
    console.error("Failed to write system log:", err);
  }
}

export default router;
