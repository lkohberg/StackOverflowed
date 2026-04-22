# StackOverflowed

StackOverflowed is a student-built web hub for HTL Steyr IT classes.
It combines useful school resources in one place so students can quickly find and share what they need.

## Why this project exists

The motivation is simple: reduce friction in daily school life.
Instead of resources being scattered across chats, cloud folders, and personal bookmarks, StackOverflowed provides one central place for:

- **Past tests** (including uploads and ZIP downloads)
- **Helpful links**
- **Browser games** for breaks
- **School forms** as downloadable PDFs
- **Anonymer Live-Chat** für schnelle Nachrichten

## What it does

The app provides a small, focused set of pages:

- `/past-tests` – filter and browse old tests, upload new ones
- `/links` – list and submit useful links
- `/browser-games` – list and submit browser games
- `/formulare` – browse and download PDF forms from the repository
- `/chat` – anonymous centralized chat (starts from tab-open time, auto-refreshes every second)

The UI text is mostly in German because the target users are local students.

## How it works (high level)

StackOverflowed is a Next.js app with:

- **App Router pages** for the frontend (`app/*/page.tsx`)
- **Route handlers** for APIs (`app/api/*/route.ts`)
- **PostgreSQL (Neon)** for dynamic data (`games`, `links`, `past_tests`, `chat_messages`)

Data flow is straightforward:
1. Pages fetch data from internal API endpoints.
2. API endpoints validate input and call data-access functions in `lib/*`.
3. `lib/db.ts` connects to Neon and ensures required tables/indexes exist.
4. Responses return JSON (or file bytes for downloads).

## Technical notes

- `games` and `links` enforce unique URLs.
- `past_tests` stores ZIP files directly in PostgreSQL (`BYTEA`) plus metadata for filtering.
- School forms are static PDFs from the `formulare/` directory, served through `/api/formulare` with filename/path validation.
- `chat_messages` stores anonymous messages and applies a coarse bad-word mask in the API before insert.

## Local development

### Requirements

- Node.js 20+
- A PostgreSQL connection string (Neon works out of the box)

### Environment variables

Set one of:

- `DATABASE_URL` (preferred)
- `POSTGRES_URL` (legacy fallback)

### Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```

## Project structure

```text
app/
  api/
    games/route.ts
    links/route.ts
    past-tests/route.ts
    formulare/route.ts
    chat/route.ts
  chat/page.tsx
  browser-games/page.tsx
  links/page.tsx
  past-tests/page.tsx
  formulare/page.tsx
components/
  NavBar.tsx
lib/
  db.ts
  games.ts
  links.ts
  past-tests.ts
  past-tests-catalog.ts
formulare/
  *.pdf
```
