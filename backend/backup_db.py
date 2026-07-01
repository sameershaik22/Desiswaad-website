"""
backup_db.py
=============
Run this BEFORE any database migration or risky change.

Creates a timestamped SQL dump of all tables in the Neon PostgreSQL database.
Backups are saved to: backend/backups/

Usage:
    python backup_db.py

Restore (if needed):
    psql <DATABASE_URL> < backups/backup_YYYYMMDD_HHMMSS.sql
"""

import os
import sys
import subprocess
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("[ERROR] DATABASE_URL not set in backend/.env")
    sys.exit(1)

# Create backups directory
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_file = os.path.join(BACKUP_DIR, f"backup_{timestamp}.sql")

print(f"[INFO] Starting backup of Neon PostgreSQL database...")
print(f"[INFO] Output file: {backup_file}")

# pg_dump with --no-password (reads from DATABASE_URL)
try:
    result = subprocess.run(
        ["pg_dump", "--no-password", "--clean", "--if-exists", "--no-acl", "--no-owner", DATABASE_URL],
        stdout=open(backup_file, "w", encoding="utf-8"),
        stderr=subprocess.PIPE,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        print(f"[ERROR] pg_dump failed:\n{result.stderr}")
        sys.exit(1)

    size_kb = os.path.getsize(backup_file) / 1024
    print(f"[OK] Backup complete: {backup_file} ({size_kb:.1f} KB)")
    print(f"\n[HOW TO RESTORE]")
    print(f"  psql {DATABASE_URL[:40]}... < {backup_file}")

except FileNotFoundError:
    # pg_dump not installed — fall back to pure Python JSON export
    print("[WARN] pg_dump not found. Falling back to JSON export...")
    _json_backup(DATABASE_URL, backup_file.replace(".sql", ".json"))

except subprocess.TimeoutExpired:
    print("[ERROR] Backup timed out after 120 seconds.")
    sys.exit(1)


def _json_backup(db_url: str, out_path: str):
    """Fallback: export all table data as JSON using SQLAlchemy."""
    import json
    from sqlalchemy import create_engine, text, inspect

    engine = create_engine(db_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    backup_data = {}
    with engine.connect() as conn:
        for table in tables:
            try:
                rows = conn.execute(text(f'SELECT * FROM "{table}"')).mappings().all()
                backup_data[table] = [dict(row) for row in rows]
                print(f"  [OK] {table}: {len(rows)} rows")
            except Exception as e:
                backup_data[table] = []
                print(f"  [WARN] {table}: {e}")

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, default=str)

    size_kb = os.path.getsize(out_path) / 1024
    print(f"\n[OK] JSON backup saved: {out_path} ({size_kb:.1f} KB)")
    print(f"\n[NOTE] To restore, use the Neon dashboard or run restore_json.py")
