import { ensureChatSchema, query } from "@/lib/db";

export type ChatMessage = {
  id: number;
  message: string;
  created_at: string;
};

async function deleteStaleChatMessages() {
  await query("DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '24 hours';");
}

export async function listChatMessages(filters: { since?: string }) {
  await ensureChatSchema();

  const values: unknown[] = [];
  const conditions: string[] = [];

  if (filters.since) {
    values.push(filters.since);
    conditions.push(`created_at >= $${values.length}::timestamptz`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query<ChatMessage>(
    `SELECT id, message, created_at
     FROM chat_messages
     ${whereClause}
     ORDER BY created_at ASC, id ASC;`,
    values,
  );

  return result.rows;
}

export async function createChatMessage(input: { message: string }) {
  await ensureChatSchema();

  // Remove messages older than 24 hours to keep storage minimal.
  await deleteStaleChatMessages();

  const result = await query<ChatMessage>(
    `INSERT INTO chat_messages (message)
     VALUES ($1)
     RETURNING id, message, created_at;`,
    [input.message],
  );

  return result.rows[0];
}
