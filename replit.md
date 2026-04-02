# Nexus - React + Express Full-Stack App

## Overview
A full-stack web application built with React (Vite) on the frontend and Express on the backend. The server uses Vite middleware in development mode to serve the SPA. Features include authentication, Spotify integration, Discord integration, analytics, and database management.

## Architecture

### Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 6
- **Backend:** Express 4, TypeScript (via tsx), better-sqlite3
- **Auth:** JWT (jsonwebtoken), bcrypt, cookie-parser
- **Other:** Google Gemini AI SDK, nodemailer, axios, recharts, lucide-react, framer motion

### Project Structure
```
/
├── server.ts           # Entry point - Express + Vite dev server on port 5000
├── server/
│   ├── db.ts           # SQLite database setup (better-sqlite3)
│   ├── middleware/
│   │   └── auth.ts     # JWT authenticateToken middleware
│   └── routes/
│       ├── auth.ts     # Auth routes (signup, login, 2FA, sessions)
│       ├── spotify.ts  # Spotify API proxy routes
│       ├── discord.ts  # Discord bot routes
│       ├── database.ts # Database stats/query routes
│       ├── logs.ts     # System logs routes
│       └── analytics.ts # Analytics routes
├── src/
│   ├── App.tsx         # Main React app
│   ├── main.tsx        # React entry point
│   ├── components/     # Shared UI components
│   ├── context/        # React context providers
│   ├── lib/            # Utilities
│   └── pages/          # Page components
├── vite.config.ts      # Vite config - allowedHosts: true, host: 0.0.0.0
└── package.json        # npm scripts
```

## Development
- **Start:** `npm run dev` (runs via `tsx server.ts`)
- **Port:** 5000 (both frontend and backend on same port via Vite middleware)
- **Build:** `npm run build` (Vite production build to `dist/`)

## Environment Variables
See `.env.example` for required variables:
- `GEMINI_API_KEY` - Google Gemini AI API key
- `APP_URL` - The hosted app URL
- `JWT_SECRET` - Secret for JWT signing
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` - Spotify OAuth credentials
- `DISCORD_BOT_TOKEN` / `DISCORD_CHANNEL_ID` - Discord bot credentials

## Environment Variables (Supabase)
The app also uses Supabase for authentication:
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase admin client
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` - Client-side Supabase client

Both Supabase clients are lazily initialized — the app starts without them, but auth features require them to be configured via Replit Secrets.

## Version 1.2.0 Changes
- **Logo styles:** Added font (system, serif, mono, impact, italic, display), visual effect (glow, neon, gradient, outline, hologram, plain), and shape (rounded, square, circle) customization. Stored in `localStorage` under `nexus-logo-style`. Exposed via `useLogoStyle()` hook.
- **14 logo colors:** Extended from 7 to 14 colors (added pink, orange, lime, teal, gold, red, sky).
- **New nav categories:** Added **Thèmes** (`/themes`) and **Widgets** (`/widgets`) pages.
- **Themes page** (`src/pages/Themes.tsx`): Consolidates logo customization (color + style), startup animations, and appearance settings (moved from Settings).
- **Widgets page** (`src/pages/Widgets.tsx`): Live clock, calendar, Spotify mini-player, system stats, and quote widgets. Widget visibility stored in `localStorage`.
- **Settings page** simplified: Removed animation/appearance sections (now in Themes). Added a link to the Themes page.

## Version 1.3.0 Changes
- **Splash screen reworks:**
  - SplashNetflix: Full cinematic rework — scan line, proper SVG N (left/right pillars + diagonal crossbar), shine sweep, ground shadow, letterbox bars
  - SplashApple: Fixed N path (was drawing M shape) — now uses three separate SVG lines with animated pathLength for a clean Apple-style N
  - SplashFire: Enhanced fire — bigger canvas (340×220), screen blend mode, upper ambient glow, smoke wisps at top, 40 embers with correct colors, delayed text reveal
- **15 splash screen rewrites** (pre-existing):
  - SplashNexus, SplashMatrix, SplashCyberpunk, SplashiOS, SplashWindows, SplashHUD, SplashGlitch, SplashAurora, SplashRetro, SplashVaporwave, SplashIce, SplashNeon
- **Sidebar fixes & new categories** (`src/components/Sidebar.tsx`):
  - Fixed text cut-off bug: NexusHub now renders as a fixed-position overlay (no longer clipped by sidebar overflow-hidden); logo header has own overflow-hidden to clip NEXUS text during width animation
  - New 5-group nav structure: Accueil (Dashboard, AI, Widgets) / Médias & Social (Spotify, Discord) / Personnel (Notes, Tâches, Favoris) / Système (Security) / Compte (Themes, Profile, Settings)
  - Spotify nav icon changed to Headphones for better semantics
- **Widgets page rework** (`src/pages/Widgets.tsx`):
  - 5 new widgets: Pomodoro (25/5 min timer with circular progress, session counter), Objectifs (mini checklist with localStorage persistence), Batterie (ring gauge with charge status, uses Battery API), Météo (enhanced with wind + humidity tiles), Compte à rebours (countdown to user-set date)
  - Total: 10 widgets (was 5)
  - Visual improvements: per-color icon tinting, corner glow effect, AnimatePresence exit animations
- **Discord gateway fixes** (`server/discord-gateway.ts`):
  - Removed duplicate `nick` slash command definition
  - Removed invalid `client.on("disconnect")` event (not valid in discord.js v14)
  - Increased reconnect cap from 10 to 25 attempts
  - Added 5 new slash commands: `/say`, `/poll`, `/giveaway`, `/emojis`, `/stickers`

## Key Notes
- The `authenticateToken` middleware lives in `server/middleware/auth.ts` (extracted to avoid circular dependency between `auth.ts` routes and `logs.ts`)
- SQLite database is used via `better-sqlite3`
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
- `server/lib/supabaseAdmin.ts` uses lazy initialization to avoid crashing on startup when env vars are not set
- `src/lib/supabase.ts` uses placeholder credentials to avoid crashing when Supabase env vars are not set
