import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="c:/Users/samee/OneDrive/Desktop/website/backend/.env")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import models

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)
db = Session()

# IDs to delete:
# 3: Achappam
# 4: Janthikalu
# 5: Murukku
# 6: Masala Boondi
ids_to_delete = [3, 4, 5, 6]

for pid in ids_to_delete:
    prod = db.query(models.Product).filter(models.Product.id == pid).first()
    if prod:
        db.delete(prod)
        print(f"Deleted {prod.name} (ID: {pid})")
    else:
        print(f"Product ID {pid} not found.")

db.commit()
print("Deletion complete.")
