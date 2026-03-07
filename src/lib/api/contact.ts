import { getDB } from "@/lib/db";

export const CONTACT_STATUSES = [
  "PENDING",
  "CONTACTED",
  "POSTPONED",
  "RESOLVED",
  "CANCELLED",
] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export type ContactMessageRow = {
  id: string;
  name: string;
  whatsapp: string;
  message: string;
  status: string;
  created_at: number;
  updated_at: number;
};

export async function ensureContactMessagesTable() {
  const db = await getDB();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`
    )
    .run();
  return db;
}

export async function createContactMessage(params: {
  name: string;
  whatsapp: string;
  message: string;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const name = (params.name ?? "").trim();
  const whatsapp = (params.whatsapp ?? "").trim();
  const message = (params.message ?? "").trim();
  if (!name || !whatsapp || !message) {
    return { success: false, error: "Name, WhatsApp, and message are required." };
  }
  const id = crypto.randomUUID();
  const db = await ensureContactMessagesTable();
  try {
    await db
      .prepare(
        `INSERT INTO contact_messages (id, name, whatsapp, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'PENDING', unixepoch(), unixepoch())`
      )
      .bind(id, name, whatsapp, message)
      .run();
    return { success: true, id };
  } catch (err) {
    console.error("createContactMessage error:", err);
    return { success: false, error: "Failed to save message." };
  }
}

export async function getAllContactMessages(): Promise<ContactMessageRow[]> {
  const db = await ensureContactMessagesTable();
  const { results } = await db
    .prepare(
      `SELECT id, name, whatsapp, message, status, created_at, updated_at
       FROM contact_messages
       ORDER BY created_at DESC`
    )
    .all<ContactMessageRow>();
  return results ?? [];
}

export async function updateContactMessageStatus(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const s = status.toUpperCase();
  if (!CONTACT_STATUSES.includes(s as ContactStatus)) {
    return { success: false, error: "Invalid status." };
  }
  const db = await ensureContactMessagesTable();
  try {
    const r = await db
      .prepare(
        `UPDATE contact_messages SET status = ?, updated_at = unixepoch() WHERE id = ?`
      )
      .bind(s, id)
      .run();
    if (r.meta.changes === 0) {
      return { success: false, error: "Message not found." };
    }
    return { success: true };
  } catch (err) {
    console.error("updateContactMessageStatus error:", err);
    return { success: false, error: "Failed to update." };
  }
}
