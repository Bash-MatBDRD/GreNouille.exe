# Nexus Panel

A personal dashboard panel with Spotify, Discord and system analytics integrations. Built with React, Express and Supabase.

## Stack

- **Frontend** — React 19, Tailwind CSS 4, React Router 7, Recharts
- **Backend** — Express, SQLite (better-sqlite3)
- **Auth** — Supabase
- **Deployment** — Vercel

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file at the root and fill in your credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The app runs on [http://localhost:5000](http://localhost:5000).

## Deploy to Vercel

The project includes a `vercel.json` configuration. Just connect your repo to Vercel and add the environment variables listed above in the Vercel dashboard.

## Features

- Authentication via Supabase
- Spotify integration
- Discord integration
- System analytics & logs
- SQLite local database
