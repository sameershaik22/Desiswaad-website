from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
import time

import os
from jose import jwt, JWTError
from app.routes.email_service import send_status_update_email

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

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks

@router.post("/")
def create_order(request: Request, order: schemas.OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        payment_status="pending"
    )
    db.add(new_order)
    
    # Auto-save address for logged-in users
    if user_id:
        existing_addr = db.query(models.Address).filter(
            models.Address.user_id == user_id,
            models.Address.address_line == order.address,
            models.Address.pincode == order.pincode
        ).first()
        
        if not existing_addr:
            # Set other addresses to non-default
            db.query(models.Address).filter(models.Address.user_id == user_id).update({models.Address.is_default: False})
            
            new_addr = models.Address(
                user_id=user_id,
                recipient_name=order.customer_name,
                phone=order.phone,
                address_line=order.address,
                city=order.city,
                state=order.state,
                pincode=order.pincode,
                country=order.country,
                is_default=True
            )
            db.add(new_addr)
    
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
    db.commit()
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

from pydantic import BaseModel
class CancelRequest(BaseModel):
    reason: str

@router.post("/user/cancel/{order_id}")
def cancel_order(order_id: str, payload: CancelRequest, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    status_lower = order.status.lower()
    if status_lower in ["shipped", "out for delivery", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled at this stage.")
        
    order.status = "Cancelled"
    
    tracking = models.Tracking(
        order_id=order_id,
        status="Cancelled",
        message=f"User Cancelled: {payload.reason}"
    )
    db.add(tracking)
    db.commit()
    
    try:
        from app.routes.email_service import send_status_update_email
        saved_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
        background_tasks.add_task(send_status_update_email, order, saved_items, "Cancelled")
    except Exception as e:
        print(f"[email] Error queuing cancel email: {e}")
    
    return {"success": True, "message": "Order cancelled successfully."}

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

@router.delete("/{order_id}")
def delete_pending_order(order_id: str, db: Session = Depends(get_db)):
    """Delete an order that was created but payment was cancelled or failed."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Only allow deleting if it's pending payment
    if order.payment_status.lower() != "pending":
        raise HTTPException(status_code=400, detail="Cannot delete a paid or completed order")
        
    # Delete related items and tracking first
    db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).delete()
    db.query(models.Tracking).filter(models.Tracking.order_id == order_id).delete()
    db.delete(order)
    db.commit()
    
    return {"success": True, "message": "Abandoned order deleted"}
