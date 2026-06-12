from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models

router = APIRouter()

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    # Hide discontinued products (Achappam, Janthikalu, Murukku, Masala Boondi)
    # This keeps them in the database for order history, but hides them from the store.
    products = db.query(models.Product).filter(models.Product.id.notin_([3, 4, 5, 6])).all()
    return {"products": products}

@router.get("/{slug}")
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not product:
        # try as ID just in case
        try:
            prod_id = int(slug)
            product = db.query(models.Product).filter(models.Product.id == prod_id).first()
        except:
            pass
            
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    reviews = db.query(models.Review).filter(models.Review.product_slug == product.slug).all()
    
    # dict copy to inject reviews
    prod_dict = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "price": product.price,
        "image": product.image,
        "category": product.category,
        "description": product.description,
        "ingredients": product.ingredients,
        "stock": product.stock,
        "created_at": product.created_at,
        "reviews": reviews
    }
    return prod_dict
