# StackOverflowed

A modern student hub for IT students at HTL Steyr.

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


