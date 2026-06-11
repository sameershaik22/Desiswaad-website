from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
import time

import os
from jose import jwt, JWTError
from app.routes.email_service import send_order_confirmation

router = APIRouter()
SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"

def get_current_user_id(request: Request, db: Session):
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(models.User).filter(models.User.email == email).first()
                if user:
                    return user.id
        except JWTError:
            pass
    return None

def serialize_order(order):
    if not order:
        return None
    d = {c.name: getattr(order, c.name) for c in order.__table__.columns}
    d["order_status"] = order.status
    return d

@router.post("/")
def create_order(request: Request, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    # Generate DS order id
    order_id = f"DS{int(time.time())}"
    
    new_order = models.Order(
        id=order_id,
        user_id=user_id,
        customer_name=order.customer_name,
        email=order.email,
        phone=order.phone,
        address=order.address,
        city=order.city,
        state=order.state,
        pincode=order.pincode,
        country=order.country,
        subtotal=order.subtotal,
        shipping=order.shipping,
        cod_charge=order.cod_charge,
        total=order.total,
        payment_mode=order.payment_mode,
        # COD is always "pending" (cash collected on delivery)
        # Online starts as "pending" — updated to "paid" by /payment/verify
        payment_status="pending"
    )
    db.add(new_order)
    
    for item in order.items:
        db_item = models.OrderItem(
            order_id=order_id,
            product_id=item.id,
            name=item.name,
            weight=item.weight,
            qty=item.qty,
            price=item.price
        )
        db.add(db_item)
        
    tracking = models.Tracking(
        order_id=order_id,
        status="Order Confirmed",
        message="Your order has been received and is being processed."
    )
    db.add(tracking)
    
    db.commit()
    # Re-query to get the full order with relationships for email
    saved_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    saved_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    # Send order confirmation email to customer (non-blocking — fails silently)
    # Only send immediately for non-Online (e.g. COD) orders. Online orders receive it after verification.
    if order.payment_mode != "Online":
        try:
            send_order_confirmation(saved_order, saved_items)
        except Exception as e:
            print(f"[email] Error sending confirmation: {e}")
    return {"success": True, "orderId": order_id}

@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    tracking = db.query(models.Tracking).filter(models.Tracking.order_id == order_id).order_by(models.Tracking.created_at.desc()).all()
    returns = db.query(models.ReturnRequest).filter(models.ReturnRequest.order_id == order_id).first()
    
    return {
        "order": serialize_order(order),
        "items": items,
        "tracking": tracking,
        "return_request": returns
    }

@router.get("/user/my-orders")
def get_my_orders(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    # Link past guest orders by email if matching
    if user.email:
        db.query(models.Order).filter(
            models.Order.email == user.email,
            models.Order.user_id == None
        ).update({models.Order.user_id: user_id}, synchronize_session=False)
        db.commit()
        
    orders = db.query(models.Order).filter(
        (models.Order.user_id == user_id) | (models.Order.email == user.email)
    ).order_by(models.Order.created_at.desc()).all()
    return {"orders": [serialize_order(o) for o in orders]}

@router.get("/user/my-orders/{order_id}")
def get_user_order(order_id: str, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    # Link past guest orders by email if matching
    if user.email:
        db.query(models.Order).filter(
            models.Order.id == order_id,
            models.Order.email == user.email,
            models.Order.user_id == None
        ).update({models.Order.user_id: user_id}, synchronize_session=False)
        db.commit()
        
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        (models.Order.user_id == user_id) | (models.Order.email == user.email)
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    tracking = db.query(models.Tracking).filter(models.Tracking.order_id == order_id).order_by(models.Tracking.created_at.asc()).all()
    returns = db.query(models.ReturnRequest).filter(models.ReturnRequest.order_id == order_id).first()
    reviews = db.query(models.Review).filter(models.Review.order_id == order_id).all()
    
    return {
        "order": serialize_order(order),
        "items": items,
        "tracking": tracking,
        "returnRequest": returns,
        "reviews": reviews
    }

