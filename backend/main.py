from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routes import auth, products, orders, returns, admin, payment, reviews, addresses

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
app.include_router(addresses.router, prefix="/api/addresses", tags=["addresses"])

@app.get("/api/my-orders")
def get_my_orders():
    # Helper endpoint wrapper pointing to the main orders logic
    pass # Managed in orders router instead
