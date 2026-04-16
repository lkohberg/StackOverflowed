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

let schemaReady = false;

export async function ensureGamesSchema() {
  if (schemaReady) {
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

  schemaReady = true;
}

export async function query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const pool = getPool();
  return pool.query<T>(text, values);
}
