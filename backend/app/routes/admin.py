from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.routes.email_service import send_order_status_update
from app.routes.orders import serialize_order
import os

router = APIRouter()

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")


def require_admin(x_admin_secret: str = Header(...)):
    """
    Dependency: every admin endpoint requires the header:
        X-Admin-Secret: <value of ADMIN_SECRET env var>

    In dev mode (ADMIN_SECRET not set), the check is skipped with a warning.
    """
    if not ADMIN_SECRET or ADMIN_SECRET == "change_this_before_going_live":
        # Dev / unconfigured — allow but warn
        import sys
        print("[admin] WARNING: ADMIN_SECRET not set — admin routes are unprotected!", file=sys.stderr)
        return
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin credentials")


@router.get("/orders", dependencies=[Depends(require_admin)])
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    result = []
    for o in orders:
        items = db.query(models.OrderItem).filter(models.OrderItem.order_id == o.id).all()
        tracking = db.query(models.Tracking).filter(models.Tracking.order_id == o.id).all()
        result.append({
            "order": serialize_order(o),
            "items": items,
            "tracking": tracking
        })
    return {"orders": result}


@router.patch("/orders/{order_id}/status", dependencies=[Depends(require_admin)])
def update_order_status(order_id: str, status_req: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_req.status
    if status_req.status.lower() == 'delivered':
        from datetime import datetime, timezone
        order.delivered_at = datetime.now(timezone.utc)
        order.payment_status = 'paid'

    tracking_message = status_req.message
    # (Delhivery automated assignment has been removed as per user request)

    tracking = models.Tracking(
        order_id=order_id,
        status=status_req.status,
        message=tracking_message
    )
    db.add(tracking)
    db.commit()

    # Send email notification to customer
    # Always email for Shipped/Delivered/Cancelled; only if notify_email=True for others
    auto_notify = status_req.status in ("Shipped", "Delivered", "Cancelled")
    if auto_notify or status_req.notify_email:
        try:
            send_order_status_update(order, status_req.status, status_req.message or "")
        except Exception as e:
            print(f"[email] Error sending status update: {e}")

    return {"success": True}


@router.get("/returns", dependencies=[Depends(require_admin)])
def get_all_returns(db: Session = Depends(get_db)):
    returns = db.query(models.ReturnRequest).order_by(models.ReturnRequest.created_at.desc()).all()
    return {"returns": returns}


@router.patch("/returns/{return_id}", dependencies=[Depends(require_admin)])
def update_return(return_id: int, req: schemas.ReturnUpdate, db: Session = Depends(get_db)):
    ret = db.query(models.ReturnRequest).filter(models.ReturnRequest.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")

    ret.status = req.status
    if req.admin_note:
        ret.admin_note = req.admin_note
    db.commit()
    return {"success": True}


@router.get("/stats", dependencies=[Depends(require_admin)])
def get_stats(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    # Total revenue ONLY includes orders where money is collected (Razorpay prepaid OR COD Delivered)
    total_sales = sum([o.total for o in orders if o.payment_status.lower() == "paid"])
    return {
        "stats": {
            "total_orders": len(orders),
            "total_sales": total_sales,
            "pending_returns": db.query(models.ReturnRequest).filter(models.ReturnRequest.status == "Pending").count()
        }
    }
