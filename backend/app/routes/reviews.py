from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.routes.orders import get_current_user_id

router = APIRouter()

@router.get("/{slug}")
def get_product_reviews(slug: str, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.product_slug == slug).order_by(models.Review.created_at.desc()).all()
    return {"reviews": reviews}

@router.post("/")
def add_review(review: schemas.ReviewCreate, request: Request, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == review.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Can only review delivered orders
    # Note: status can be "Delivered" or "delivered" (case-insensitive check)
    if order.status.lower() != "delivered":
        raise HTTPException(status_code=400, detail="Can only review delivered orders")
        
    # Security/JWT check:
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or (order.user_id != user_id and order.email != user.email):
        raise HTTPException(status_code=403, detail="Forbidden: Not authorized to review this order")
            
    # Check if user has already reviewed this product in this order
    exists = db.query(models.Review).filter(
        models.Review.order_id == review.order_id,
        models.Review.product_slug == review.product_slug
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="You have already reviewed this product in this order")
        
    new_review = models.Review(
        order_id=review.order_id,
        product_slug=review.product_slug,
        customer_name=order.customer_name,
        rating=review.rating,
        review_text=review.review_text
    )
    db.add(new_review)
    db.commit()
    return {"success": True}
