from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.routes.orders import get_current_user_id

router = APIRouter()

@router.post("/")
def create_return(request: Request, return_req: schemas.ReturnCreate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == return_req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    exists = db.query(models.ReturnRequest).filter(models.ReturnRequest.order_id == return_req.order_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Return already requested for this order")

    # Amazon-style 24-hour food product return policy
    if order.status.lower() != 'delivered':
        raise HTTPException(status_code=400, detail="Order is not delivered yet")
    if not order.delivered_at:
        raise HTTPException(status_code=400, detail="Delivery timestamp missing. Cannot process return.")
    
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    delivered_time = order.delivered_at
    if delivered_time.tzinfo is None:
        delivered_time = delivered_time.replace(tzinfo=timezone.utc)
    
    if now > delivered_time + timedelta(hours=24):
        raise HTTPException(status_code=403, detail="Return window expired")

    # Security check: verify order ownership
    user_id = get_current_user_id(request, db)
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user or (order.user_id != user_id and order.email != user.email):
            raise HTTPException(status_code=403, detail="Not authorized to request return for this order")
    else:
        # Guest: Verify matching email on the order
        if not return_req.customer_email or return_req.customer_email.lower().strip() != order.email.lower().strip():
            raise HTTPException(status_code=403, detail="Email address does not match this order")
        
    new_return = models.ReturnRequest(
        order_id=return_req.order_id,
        customer_name=return_req.customer_name or order.customer_name,
        customer_email=return_req.customer_email or order.email,
        reason=return_req.reason,
        description=return_req.description,
        image_url=return_req.image_url
    )
    db.add(new_return)
    db.commit()
    return {"success": True}
