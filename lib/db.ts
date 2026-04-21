import { Pool } from "@neondatabase/serverless";

declare global {
  var __stackOverflowedPool: Pool | undefined;
}

function getPool() {
  // Neon injects DATABASE_URL; POSTGRES_URL is kept for backward compatibility.
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is not configured.");
  }

  if (!global.__stackOverflowedPool) {
    global.__stackOverflowedPool = new Pool({ connectionString });
  }

  return global.__stackOverflowedPool;
}

const schemaReady = {
  games: false,
  links: false,
  pastTests: false,
};

export async function ensureGamesSchema() {
  if (schemaReady.games) {
    return;
  }

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  schemaReady.games = true;
}

export async function ensureLinksSchema() {
  if (schemaReady.links) {
    return;
  }

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  schemaReady.links = true;
}

export async function ensurePastTestsSchema() {
  if (schemaReady.pastTests) {
    return;
  }

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS past_tests (
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

    CREATE INDEX IF NOT EXISTS past_tests_filter_idx
      ON past_tests (class_name, subject, teacher, test_number, created_at DESC);

    -- Keep this for existing databases created before school_level was introduced.
    ALTER TABLE past_tests
      ADD COLUMN IF NOT EXISTS school_level TEXT;

    -- Migration for existing databases created before department was introduced.
    ALTER TABLE past_tests
      ADD COLUMN IF NOT EXISTS department TEXT;

    UPDATE past_tests
      SET department = CASE
        WHEN class_name ~* 'ahitn$' THEN 'informatik'
        WHEN class_name ~* 'ahmb$' THEN 'maschinenbau'
        WHEN class_name ~* 'ahel$' THEN 'elektronik'
        WHEN class_name ~* 'ahme$' THEN 'mechatronik'
        WHEN class_name ~* 'ahad$' THEN 'art-design'
        ELSE 'informatik'
      END
      WHERE department IS NULL OR BTRIM(department) = '';

    -- Keep this for existing databases created before topic_summary was introduced.
    ALTER TABLE past_tests
      ADD COLUMN IF NOT EXISTS topic_summary TEXT;

    ALTER TABLE past_tests
      ALTER COLUMN topic_summary SET DEFAULT 'Keine Beschreibung';

    UPDATE past_tests
      SET topic_summary = 'Keine Beschreibung'
      WHERE topic_summary IS NULL OR BTRIM(topic_summary) = '';

    ALTER TABLE past_tests
      ALTER COLUMN topic_summary SET NOT NULL;

    CREATE INDEX IF NOT EXISTS past_tests_school_level_filter_idx
      ON past_tests (school_level, subject, teacher, test_number, created_at DESC);

    CREATE INDEX IF NOT EXISTS past_tests_department_filter_idx
      ON past_tests (department, school_level, subject, teacher, test_number, created_at DESC);
  `);

  schemaReady.pastTests = true;
}

export async function query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const pool = getPool();
  return pool.query<T>(text, values);
}
