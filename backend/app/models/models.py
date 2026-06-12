from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)   # nullable for Google-only accounts
    google_id = Column(String, unique=True, nullable=True, index=True)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user")
    saved_addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")

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
    payment_status = Column(String, default="pending")   # "pending" | "paid"
    status = Column(String, default="Pending")
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Delivery partner integration fields
    delivery_partner = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    awb_number = Column(String, nullable=True)
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)

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
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_slug = Column(String, index=True)
    customer_name = Column(String)
    rating = Column(Integer)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String)  # e.g., "Home", "Office"
    recipient_name = Column(String)
    phone = Column(String)
    address_line = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String, default="India")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_addresses")


