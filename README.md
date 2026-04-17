# StackOverflowed

A modern student hub for IT students at HTL Steyr.

## Why Vercel DB (Postgres) (instead of Vercel KV)

This project uses **Vercel DB (Postgres)** because it is a strong fit for structured records (`id`, `title`, `url`, `description`, `created_at`), supports uniqueness constraints for duplicate URL prevention, and is production-ready on Vercel.

## Project structure

```text
StackOverflowed/
├── app/
│   ├── api/games/route.ts          # GET/POST API for browser games
│   ├── api/links/route.ts          # GET/POST API for useful links
│   ├── api/past-tests/route.ts     # GET/POST API for past tests + downloads
│   ├── browser-games/page.tsx      # Browser games directory + submit form
│   ├── links/page.tsx              # Links directory + submit form
│   ├── past-tests/page.tsx         # Past tests page (filters + upload)
│   ├── globals.css                 # Global Tailwind styles
│   ├── layout.tsx                  # Root layout + navigation
│   └── page.tsx                    # Homepage
├── components/
│   └── NavBar.tsx                  # Main navigation component
├── lib/
│   ├── db.ts                       # Vercel DB (Postgres) connection and schema setup
│   ├── games.ts                    # Games data access functions
│   ├── links.ts                    # Links data access functions
│   └── past-tests.ts               # Past tests data access functions
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

CREATE TABLE links (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE past_tests (
  id BIGSERIAL PRIMARY KEY,
  class_name TEXT NOT NULL,
  school_level TEXT,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  test_number SMALLINT NOT NULL,
  upload_year INTEGER NOT NULL,
  topic_summary TEXT NOT NULL DEFAULT 'Keine Beschreibung',
  file_name TEXT NOT NULL,
  file_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX past_tests_filter_idx
  ON past_tests (class_name, subject, teacher, test_number, created_at DESC);

CREATE INDEX past_tests_school_level_filter_idx
  ON past_tests (school_level, subject, teacher, test_number, created_at DESC);
```

### Notes

- Tables are created automatically on first API usage.
- `past_tests.topic_summary` is normalized to `NOT NULL DEFAULT 'Keine Beschreibung'`.
- For legacy rows without `school_level`, reads fall back to `LEFT(class_name, 1)`.

## API

- `GET /api/games` → returns all games ordered by newest first
- `POST /api/games` → creates a game (validates required fields, URL format, and duplicate URL)
- `GET /api/links` → returns all links ordered by newest first
- `POST /api/links` → creates a link (validates required fields, URL format, and duplicate URL)
- `GET /api/past-tests` → returns tests with optional filters (`schoolLevel`, `subject`, `teacher`, `testNumber`)
- `GET /api/past-tests?downloadId=<id>` → downloads stored ZIP for a test
- `POST /api/past-tests` → uploads a past test ZIP with validated metadata

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:

   ```bash
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
   # or:
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
3. Add `DATABASE_URL` (or `POSTGRES_URL`) in Vercel project environment variables.
4. Deploy.
