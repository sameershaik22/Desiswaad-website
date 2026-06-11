from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    id_token: str

class OrderItemCreate(BaseModel):
    id: int
    name: str
    weight: Optional[str] = None
    qty: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    country: str
    subtotal: float
    shipping: float
    cod_charge: float
    total: float
    payment_mode: str
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str
    message: Optional[str] = None
    notify_email: Optional[bool] = False

class ReturnCreate(BaseModel):
    order_id: str
    reason: str
    description: str
    image_url: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None

class ReturnUpdate(BaseModel):
    status: str
    admin_note: Optional[str] = None

class ReviewCreate(BaseModel):
    order_id: str
    product_slug: str
    rating: int
    review_text: str

class PaymentCreate(BaseModel):
    amount: float
    receipt: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: Optional[str] = None  # our DS order id

class AddressCreate(BaseModel):
    name: str
    recipient_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    country: Optional[str] = "India"
    is_default: Optional[bool] = False

class AddressResponse(BaseModel):
    id: int
    user_id: int
    name: str
    recipient_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

