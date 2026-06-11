import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL if DATABASE_URL is set, else default to SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./desiswad.db")

print(f"Connecting to database: {SQLALCHEMY_DATABASE_URL}")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    alter_query = "ALTER TABLE orders ADD COLUMN delivered_at DATETIME;"
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    alter_query = "ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;"

try:
    with engine.connect() as conn:
        conn.execute(text(alter_query))
        conn.commit()
    print("Migration successful: Added delivered_at to orders table.")
except Exception as e:
    if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
        print("Column delivered_at already exists. No action needed.")
    else:
        print(f"Migration failed: {e}")
        sys.exit(1)
