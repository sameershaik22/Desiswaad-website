from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import schemas
from app.database.database import get_db
from app.models import models
import os
import razorpay
import hmac
import hashlib

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_SECRET:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))


@router.post("/create-order")
def create_payment_order(req: schemas.PaymentCreate):
    """Create a Razorpay order session. Returns amount, currency, orderId."""
    if not client:
        # Dev mode — return a mock order so checkout can still proceed
        return {"amount": int(req.amount * 100), "currency": "INR", "orderId": "dev_test_order"}

    try:
        data = {
            "amount": int(req.amount * 100),  # Razorpay uses paise
            "currency": "INR",
            "receipt": req.receipt,
        }
        order = client.order.create(data=data)
        return {"amount": order["amount"], "currency": order["currency"], "orderId": order["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
def verify_payment(req: schemas.PaymentVerify, db: Session = Depends(get_db)):
    """
    Verify Razorpay payment signature using HMAC-SHA256.
    SECURITY-CRITICAL: prevents fake/forged payment confirmations.

    On success → marks the order's payment_status = "paid" in the DB.

    Razorpay signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    """
    # ── Dev mode: skip signature check when Razorpay keys not configured ──
    if not RAZORPAY_SECRET or RAZORPAY_SECRET == "YourKeySecretHere":
        # Still update DB in dev mode so the UI shows "PAID"
        if req.order_id:
            _mark_paid(req.order_id, req.razorpay_payment_id, db)
        return {"success": True, "message": "dev_mode_skip_verification"}

    # ── Production: verify HMAC-SHA256 signature ──
    message = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"

    expected_signature = hmac.new(
        RAZORPAY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # ── Signature valid → mark order as paid in database ──
    if req.order_id:
        _mark_paid(req.order_id, req.razorpay_payment_id, db)

    return {"success": True, "message": "Payment verified and order updated"}


def _mark_paid(ds_order_id: str, razorpay_payment_id: str, db: Session):
    """Set payment_status='paid' on the DS order record."""
    order = db.query(models.Order).filter(models.Order.id == ds_order_id).first()
    if order:
        order.payment_status = "paid"
        # Store Razorpay payment ID in a note for reference (optional but useful)
        # We store it in status notes via a tracking event
        from app.models import models as m
        tracking = m.Tracking(
            order_id=ds_order_id,
            status=order.status,
            message=f"Payment confirmed via Razorpay (ID: {razorpay_payment_id})"
        )
        db.add(tracking)
        db.commit()
        
        # Send order confirmation email now that it is paid
        try:
            from app.routes.email_service import send_order_confirmation
            saved_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == ds_order_id).all()
            send_order_confirmation(order, saved_items)
        except Exception as e:
            print(f"[email] Error sending confirmation: {e}")
