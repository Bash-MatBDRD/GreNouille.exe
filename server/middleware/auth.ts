import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import db from "../db.js";

export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return res.status(403).json({ error: "Forbidden" });

  let dbUser = db.prepare("SELECT * FROM users WHERE supabase_id = ?").get(user.id) as any;

  if (!dbUser) {
    const meta = user.user_metadata || {};
    const username =
      (meta.username as string) ||
      user.email?.split("@")[0] ||
      "user";
    try {
      db.prepare(
        "INSERT INTO users (supabase_id, username, email, password, discordId, avatarUrl, twoFactorEnabled) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(
        user.id,
        username,
        user.email || "",
        "",
        meta.discordId || null,
        meta.avatarUrl || null,
        meta.twoFactorEnabled ? 1 : 0
      );
      dbUser = db.prepare("SELECT * FROM users WHERE supabase_id = ?").get(user.id) as any;
    } catch (e) {
      dbUser = db.prepare("SELECT * FROM users WHERE email = ?").get(user.email) as any;
      if (dbUser && !dbUser.supabase_id) {
        db.prepare("UPDATE users SET supabase_id = ? WHERE id = ?").run(user.id, dbUser.id);
        dbUser.supabase_id = user.id;
      }
    }
  } else {
    const meta = user.user_metadata || {};
    const updates: string[] = [];
    const vals: any[] = [];

    if (meta.discordId && !dbUser.discordId) {
      updates.push("discordId = ?"); vals.push(meta.discordId);
    }
    if (meta.avatarUrl && !dbUser.avatarUrl) {
      updates.push("avatarUrl = ?"); vals.push(meta.avatarUrl);
    }
    if (meta.twoFactorEnabled !== undefined && dbUser.twoFactorEnabled !== (meta.twoFactorEnabled ? 1 : 0)) {
      updates.push("twoFactorEnabled = ?"); vals.push(meta.twoFactorEnabled ? 1 : 0);
    }
    if (updates.length > 0) {
      vals.push(dbUser.id);
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...vals);
      dbUser = db.prepare("SELECT * FROM users WHERE id = ?").get(dbUser.id) as any;
    }
  }

  req.user = {
    supabaseId: user.id,
    id: dbUser?.id,
    username: dbUser?.username || user.email?.split("@")[0],
    email: user.email,
    ...dbUser,
  };

  next();
};
