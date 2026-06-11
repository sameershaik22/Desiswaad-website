import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: './server/desiswad.db',
      driver: sqlite3.Database,
    });
    // Ensure new columns exist (idempotent)
    await db.exec(`ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'placed'`).catch(() => {});
    await db.exec(`ALTER TABLE orders ADD COLUMN lat REAL`).catch(() => {});
    await db.exec(`ALTER TABLE orders ADD COLUMN lng REAL`).catch(() => {});
    // Ensure order_items has quantity column (already present) and rename if needed
    // No further changes needed
  }
  return db;
}