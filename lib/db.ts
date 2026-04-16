import { createPool } from "@vercel/postgres";
import type { QueryResultRow } from "@vercel/postgres";

declare global {
  var __stackOverflowedPool: ReturnType<typeof createPool> | undefined;
}

function getPool() {
  // Support DATABASE_URL for backward compatibility with older deployments/local setups.
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL (or DATABASE_URL) is not configured.");
  }

  if (!global.__stackOverflowedPool) {
    global.__stackOverflowedPool = createPool({
      connectionString,
    });
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

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const pool = getPool();
  return pool.query<T>(text, values);
}
