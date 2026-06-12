import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(dotenv_path="c:/Users/samee/OneDrive/Desktop/website/backend/.env")

engine = create_engine(os.getenv("DATABASE_URL"))

queries = [
    "ALTER TABLE orders ADD COLUMN delivery_partner VARCHAR;",
    "ALTER TABLE orders ADD COLUMN tracking_number VARCHAR;",
    "ALTER TABLE orders ADD COLUMN awb_number VARCHAR;",
    "ALTER TABLE orders ADD COLUMN expected_delivery_date TIMESTAMP WITH TIME ZONE;"
]

with engine.connect() as conn:
    for q in queries:
        try:
            conn.execute(text(q))
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Error on {q}: {e}")
    conn.commit()

print("Migration complete.")
