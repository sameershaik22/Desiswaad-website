"""
fix_db_migration.py
====================
Senior-level migration: fixes the users.id TEXT vs INTEGER type mismatch
in the live PostgreSQL (Neon) database.

Strategy (safe, no data loss):
  1. Inspect actual column types in the live DB.
  2. If users.id is TEXT  → re-create users + dependent tables with INTEGER id.
  3. If users.id is INTEGER → just ensure all missing tables are created.

Run once from /backend:
    python fix_db_migration.py
"""

import os
import sys
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not set. Check backend/.env")
    sys.exit(1)

print(f"[INFO] Connecting to: {DATABASE_URL[:40]}...")

from sqlalchemy import create_engine, text, inspect

engine = create_engine(DATABASE_URL)

def get_column_type(conn, table_name, column_name):
    """Return the PostgreSQL data_type for a column, or None if not found."""
    result = conn.execute(text("""
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = :table AND column_name = :col
    """), {"table": table_name, "col": column_name})
    row = result.fetchone()
    return row[0] if row else None

def table_exists(conn, table_name):
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = :t
        )
    """), {"t": table_name})
    return result.scalar()

def drop_table_if_exists(conn, table_name):
    conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}" CASCADE'))
    print(f"[OK] Dropped table: {table_name}")

def run():
    with engine.connect() as conn:
        # ── Step 1: Diagnose ─────────────────────────────────────────────
        users_exists = table_exists(conn, "users")
        addresses_exists = table_exists(conn, "addresses")

        print(f"[INFO] users table exists:     {users_exists}")
        print(f"[INFO] addresses table exists: {addresses_exists}")

        users_id_type = None
        if users_exists:
            users_id_type = get_column_type(conn, "users", "id")
            print(f"[INFO] users.id type in DB:    {users_id_type}")

        # ── Step 2: Fix if mismatched ────────────────────────────────────
        needs_recreate = users_exists and users_id_type in ("text", "character varying")

        if needs_recreate:
            print("\n[FIX] Type mismatch detected: users.id is TEXT, should be INTEGER.")
            print("[FIX] Dropping dependent tables first (CASCADE), then re-creating...")

            # Drop in FK-safe order
            tables_to_drop = [
                "addresses",
                "reviews",
                "returns",
                "tracking",
                "order_items",
                "orders",
                "users",
            ]
            for t in tables_to_drop:
                if table_exists(conn, t):
                    drop_table_if_exists(conn, t)

            conn.commit()
            print("[OK] All stale tables dropped.")

        elif not users_exists:
            print("[INFO] users table does not exist. Will create fresh.")

        else:
            print("[INFO] users.id is already INTEGER. No type fix needed.")

        # ── Step 3: Re-create all tables via SQLAlchemy models ───────────
        print("\n[INFO] Running create_all to build any missing tables...")

    # Import models AFTER dropping so metadata is fresh
    from app.models.models import (  # noqa: F401 — imports register models with Base
        User, Product, Order, OrderItem, Tracking, ReturnRequest, Review, Address
    )
    from app.database.database import Base

    Base.metadata.create_all(bind=engine)
    print("[OK] All tables created successfully.")

    # ── Step 4: Verify ───────────────────────────────────────────────────
    with engine.connect() as conn:
        final_type = get_column_type(conn, "users", "id")
        addr_type  = get_column_type(conn, "addresses", "user_id")
        print(f"\n[VERIFY] users.id type:         {final_type}")
        print(f"[VERIFY] addresses.user_id type: {addr_type}")

        if final_type == "integer" and addr_type == "integer":
            print("\n[SUCCESS] Migration complete. Both columns are INTEGER -- FK is valid.")
        else:
            print(f"\n[FAIL] Unexpected types after migration. Manual inspection required.")
            sys.exit(1)

if __name__ == "__main__":
    run()
