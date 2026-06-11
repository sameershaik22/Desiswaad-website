"""
migrate_payment_status.py
Adds payment_status column to the existing orders table in production DB.
SQLAlchemy's create_all() only creates NEW tables, not new columns in existing ones.
Run this ONCE after deploying the new code.
"""
import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./desiswad.db")
engine = create_engine(DATABASE_URL)

SQL = """
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR NOT NULL DEFAULT 'pending';
"""

with engine.connect() as conn:
    try:
        conn.execute(text(SQL))
        conn.commit()
        print("✅ Migration OK: payment_status column added (or already existed)")
    except Exception as e:
        print(f"⚠️  Migration note: {e}")
