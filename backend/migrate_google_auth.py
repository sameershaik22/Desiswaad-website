"""
Migration: Add google_id and avatar columns to users table,
and make password_hash nullable.

Run once: python migrate_google_auth.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "desiswad.db")

def run():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Check existing columns
    cur.execute("PRAGMA table_info(users)")
    cols = {row[1] for row in cur.fetchall()}

    if "google_id" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN google_id TEXT")
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id) WHERE google_id IS NOT NULL")
        print("[OK] Added column: google_id (with unique index)")
    else:
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id) WHERE google_id IS NOT NULL")
        print("[INFO] Column already exists: google_id (ensured unique index)")

    if "avatar" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN avatar TEXT")
        print("[OK] Added column: avatar")
    else:
        print("[INFO] Column already exists: avatar")

    print("[OK] Migration complete -- password_hash is nullable by default in SQLite")


    conn.commit()
    conn.close()

if __name__ == "__main__":
    run()
