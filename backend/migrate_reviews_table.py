import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./desiswad.db")
print(f"Running migration on: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # 1. Add order_id column
    try:
        if "sqlite" in DATABASE_URL:
            conn.execute(text("ALTER TABLE reviews ADD COLUMN order_id VARCHAR"))
        else:
            conn.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id VARCHAR"))
        conn.commit()
        print("OK: Added order_id column to reviews")
    except Exception as e:
        print(f"Note order_id: {e}")

    # 2. Rename comment to review_text
    try:
        conn.execute(text("ALTER TABLE reviews RENAME COLUMN comment TO review_text"))
        conn.commit()
        print("OK: Renamed comment to review_text in reviews")
    except Exception as e:
        print(f"Note rename comment: {e}")
