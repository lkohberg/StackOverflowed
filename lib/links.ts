import { ensureLinksSchema, query } from "@/lib/db";

export type LinkEntry = {
  id: number;
  title: string;
  url: string;
  description: string | null;
  created_at: string;
};

export class DuplicateLinkError extends Error {
  constructor() {
    super("Ein Link mit dieser URL existiert bereits.");
  }
}

export async function listLinks() {
  await ensureLinksSchema();

  const result = await query<LinkEntry>(
    "SELECT id, title, url, description, created_at FROM links ORDER BY created_at DESC;",
  );

  return result.rows;
}

export async function createLink(input: {
  title: string;
  url: string;
  description: string | null;
}) {
  await ensureLinksSchema();

  try {
    const result = await query<LinkEntry>(
      `INSERT INTO links (title, url, description)
       VALUES ($1, $2, $3)
       RETURNING id, title, url, description, created_at;`,
      [input.title, input.url, input.description],
    );

    return result.rows[0];
  } catch (error) {
    const err = error as { code?: string };

    if (err.code === "23505") {
      throw new DuplicateLinkError();
    }

    throw error;
  }
}

export async function deleteLink(id: number) {
  await ensureLinksSchema();

  const result = await query<{ id: number }>(
    `DELETE FROM links
     WHERE id = $1
     RETURNING id;`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
