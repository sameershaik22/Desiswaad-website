from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load env vars
root_env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(dotenv_path=root_env_path)
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./desiswad.db")
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

Session = sessionmaker(bind=engine)
session = Session()

from app.models import models

def clear_data():
    try:
        # Delete dependent records first to avoid foreign key constraint errors
        print("Deleting Tracking...")
        session.query(models.Tracking).delete()
        print("Deleting Order Items...")
        session.query(models.OrderItem).delete()
        print("Deleting Return Requests...")
        session.query(models.ReturnRequest).delete()
        print("Deleting Reviews...")
        session.query(models.Review).delete()
        
        # Delete Orders and Addresses
        print("Deleting Orders...")
        session.query(models.Order).delete()
        print("Deleting Addresses...")
        session.query(models.Address).delete()
        
        # Delete Users last
        print("Deleting Users...")
        session.query(models.User).delete()
        
        # We DO NOT delete Products so the catalog remains intact.
        
        session.commit()
        print("All user data has been successfully cleared!")
    except Exception as e:
        session.rollback()
        print("Error clearing data:", str(e))
    finally:
        session.close()

if __name__ == "__main__":
    clear_data()
