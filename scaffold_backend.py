import os

backend_dir = os.path.join(os.getcwd(), 'backend')
os.makedirs(backend_dir, exist_ok=True)

files = {
    "requirements.txt": """fastapi
uvicorn
sqlalchemy
psycopg2-binary
python-dotenv
pydantic
passlib[bcrypt]
python-jose[cryptography]
razorpay
""",
    "main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routes import auth, products, orders, returns, admin, payment, reviews

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DesiSwad API", version="1.0.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(returns.router, prefix="/api/returns", tags=["returns"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])

@app.get("/api/my-orders")
def get_my_orders():
    # Helper endpoint wrapper pointing to the main orders logic
    pass # Managed in orders router instead
""",
    "app/__init__.py": "",
    "app/database/__init__.py": "",
    "app/database/database.py": """import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL if DATABASE_URL is set, else default to SQLite for dev
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./desiswad.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""",
    "app/models/__init__.py": "",
    "app/models/models.py": """from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    price = Column(Float)
    image = Column(String, nullable=True)
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    stock = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True) # e.g. DS171...
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String)
    subtotal = Column(Float)
    shipping = Column(Float)
    cod_charge = Column(Float)
    total = Column(Float)
    payment_mode = Column(String)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    tracking = relationship("Tracking", back_populates="order")
    return_request = relationship("ReturnRequest", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    name = Column(String)
    weight = Column(String, nullable=True)
    qty = Column(Integer)
    price = Column(Float)

    order = relationship("Order", back_populates="items")

class Tracking(Base):
    __tablename__ = "tracking"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    status = Column(String)
    message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="tracking")

class ReturnRequest(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), unique=True)
    customer_name = Column(String)
    customer_email = Column(String)
    reason = Column(String)
    description = Column(Text)
    image_url = Column(String, nullable=True)
    status = Column(String, default="Pending")
    admin_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="return_request")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_slug = Column(String, index=True)
    customer_name = Column(String)
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
""",
    "app/schemas/__init__.py": "",
    "app/schemas/schemas.py": """from pydantic import BaseModel, EmailStr
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
    product_slug: str
    customer_name: str
    rating: int
    comment: str

class PaymentCreate(BaseModel):
    amount: float
    receipt: str
""",
    "app/routes/__init__.py": "",
    "app/routes/auth.py": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"sub": new_user.email})
    return {"token": token, "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": db_user.email})
    return {"token": token, "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email}}
""",
    "app/routes/products.py": """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models

router = APIRouter()

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
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
""",
    "app/routes/orders.py": """from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
import time

router = APIRouter()

@router.post("/")
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Generate DS order id
    order_id = f"DS{int(time.time())}"
    
    new_order = models.Order(
        id=order_id,
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
        payment_mode=order.payment_mode
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
        "order": order,
        "items": items,
        "tracking": tracking,
        "return_request": returns
    }

@router.get("/user/my-orders")
def get_my_orders(request: Request, db: Session = Depends(get_db)):
    # Very basic auth resolution. (For full prod, use FastAPI dependencies)
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    # Assume user info is retrieved (stubbed out for now)
    # Ideally, decode JWT and get user.email
    # For now returning all orders
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return {"orders": orders}
""",
    "app/routes/returns.py": """from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/")
def create_return(return_req: schemas.ReturnCreate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == return_req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    exists = db.query(models.ReturnRequest).filter(models.ReturnRequest.order_id == return_req.order_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Return already requested for this order")
        
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
""",
    "app/routes/admin.py": """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/orders")
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    result = []
    for o in orders:
        items = db.query(models.OrderItem).filter(models.OrderItem.order_id == o.id).all()
        tracking = db.query(models.Tracking).filter(models.Tracking.order_id == o.id).all()
        result.append({
            "order": o,
            "items": items,
            "tracking": tracking
        })
    return {"orders": result}

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, status_req: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_req.status
    tracking = models.Tracking(
        order_id=order_id,
        status=status_req.status,
        message=status_req.message
    )
    db.add(tracking)
    db.commit()
    return {"success": True}

@router.get("/returns")
def get_all_returns(db: Session = Depends(get_db)):
    returns = db.query(models.ReturnRequest).order_by(models.ReturnRequest.created_at.desc()).all()
    return {"returns": returns}

@router.patch("/returns/{return_id}")
def update_return(return_id: int, req: schemas.ReturnUpdate, db: Session = Depends(get_db)):
    ret = db.query(models.ReturnRequest).filter(models.ReturnRequest.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")
    
    ret.status = req.status
    if req.admin_note:
        ret.admin_note = req.admin_note
    db.commit()
    return {"success": True}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    total_sales = sum([o.total for o in orders if o.status != "Cancelled"])
    return {
        "stats": {
            "total_orders": len(orders),
            "total_sales": total_sales,
            "pending_returns": db.query(models.ReturnRequest).filter(models.ReturnRequest.status == "Pending").count()
        }
    }
""",
    "app/routes/payment.py": """from fastapi import APIRouter, HTTPException
from app.schemas import schemas
import os
import razorpay

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_SECRET:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))

@router.post("/create-order")
def create_payment_order(req: schemas.PaymentCreate):
    if not client:
        return {"amount": int(req.amount * 100), "currency": "INR", "orderId": "dev_test_order"}
        
    try:
        data = {
            "amount": int(req.amount * 100),
            "currency": "INR",
            "receipt": req.receipt,
        }
        order = client.order.create(data=data)
        return {"amount": order["amount"], "currency": order["currency"], "orderId": order["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(req: dict):
    # Stub verification
    return {"success": True}
""",
    "app/routes/reviews.py": """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/")
def add_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    new_review = models.Review(
        product_slug=review.product_slug,
        customer_name=review.customer_name,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    return {"success": True}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(backend_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Successfully generated FastAPI project structure in {backend_dir}")
