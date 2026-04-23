import { ensureGamesSchema, query } from "@/lib/db";

export type Game = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};

export class DuplicateGameError extends Error {
  constructor() {
    super("Ein Spiel mit dieser URL existiert bereits.");
  }
}

export async function listGames() {
  await ensureGamesSchema();

  const result = await query<Game>(
    "SELECT id, title, url, description, created_at FROM games ORDER BY created_at DESC;",
  );

  return result.rows;
}

export async function createGame(input: {
  title: string;
  url: string;
  description: string | null;
}) {
  await ensureGamesSchema();

  try {
    const result = await query<Game>(
      `INSERT INTO games (title, url, description)
       VALUES ($1, $2, $3)
       RETURNING id, title, url, description, created_at;`,
      [input.title, input.url, input.description],
    );

    return result.rows[0];
  } catch (error) {
    const err = error as { code?: string };

    if (err.code === "23505") {
      throw new DuplicateGameError();
    }

    throw error;
  }
}

export async function deleteGame(id: number) {
  await ensureGamesSchema();

  const result = await query<{ id: number }>(
    `DELETE FROM games
     WHERE id = $1
     RETURNING id;`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
