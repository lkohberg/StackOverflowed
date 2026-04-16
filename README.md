# StackOverflowed

A modern student hub for IT students at HTL Steyr.

## Why Vercel DB (Postgres) (instead of Vercel KV)

This project uses **Vercel DB (Postgres)** because it is a strong fit for structured records (`id`, `title`, `url`, `description`, `created_at`), supports uniqueness constraints for duplicate URL prevention, and is production-ready on Vercel.

## Project structure

```text
StackOverflowed/
├── app/
│   ├── api/games/route.ts          # GET/POST API for browser games
│   ├── browser-games/page.tsx      # Browser games directory + submit form
│   ├── past-tests/page.tsx         # Past tests placeholder page
│   ├── globals.css                 # Global Tailwind styles
│   ├── layout.tsx                  # Root layout + navigation
│   └── page.tsx                    # Homepage
├── components/
│   └── NavBar.tsx                  # Main navigation component
├── lib/
│   ├── db.ts                       # Vercel DB (Postgres) connection and schema setup
│   └── games.ts                    # Games data access functions
├── package.json
└── README.md
```

## Database schema

```sql
CREATE TABLE games (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## API

- `GET /api/games` → returns all games ordered by newest first
- `POST /api/games` → creates a game (validates required fields, URL format, and duplicate URL)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:

   ```bash
   POSTGRES_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add `POSTGRES_URL` in Vercel project environment variables.
4. Deploy.

The app creates the `games` table automatically on first API usage.
