import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="c:/Users/samee/OneDrive/Desktop/website/backend/.env")

from app.database.database import engine, Base
from app.models import models

print("Creating all missing tables (including 'addresses')...")
try:
    Base.metadata.create_all(bind=engine)
    print("OK: Table creation completed successfully.")
except Exception as e:
    print(f"Error: {e}")
