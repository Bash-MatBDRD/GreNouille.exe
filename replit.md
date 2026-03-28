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

## Key Notes
- The `authenticateToken` middleware lives in `server/middleware/auth.ts` (extracted to avoid circular dependency between `auth.ts` routes and `logs.ts`)
- `uuid` package is installed separately (not in original package.json)
- SQLite database is used via `better-sqlite3`
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
