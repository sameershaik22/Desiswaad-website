# DesiSwad Foods - E-Commerce Platform

DesiSwad Foods is a full-stack, enterprise-grade e-commerce web application built for selling authentic homemade Telangana snacks. It features a complete end-to-end shopping experience, secure online payments, and an automated logistics integration.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Vanilla CSS (Responsive & Modern Aesthetics)
- **State Management:** Zustand (for Cart & Auth State)
- **Payments:** Razorpay Checkout Integration

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (via NeonDB)
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens)
- **Logistics Integration:** Delhivery API

---

## ✨ Key Features

### 🛒 Customer Experience
- **Dynamic Product Catalog:** View snacks with prices, weights, and detailed descriptions.
- **Cart Management:** Add items to cart, adjust quantities, and view subtotal.
- **Seamless Checkout:** Customers can choose between **Pre-paid (Razorpay UPI/Card)** or **Cash on Delivery (COD)**.
- **Automated Order Tracking:** Dedicated `/track` page for customers to see real-time updates on their order status.
- **Abandoned Cart Cleanup:** Automatically clears pending database orders if a user cancels the Razorpay payment window.
- **Social Integration:** WhatsApp floating action button for instant customer support.

### 🛡️ Admin & Order Management
- **Secure Admin Dashboard:** Protected route to manage all incoming orders.
- **Automated Logistics (Delhivery):** 
  - Clicking "Shipped" automatically sends the customer address & package details to Delhivery.
  - Automatically generates an AWB Tracking Number.
  - Supports both Prepaid and COD handoffs to the delivery driver.
- **Revenue Analytics:** Tracks total online sales and delivered COD sales in real-time.
- **Email Notifications:** Automatic SMTP integration sends order confirmation emails to customers upon successful payment or COD placement.

---

## 📂 Project Structure

```text
website/
├── app/                  # Next.js Frontend Routes (App Router)
│   ├── admin/            # Admin Dashboard (Protected)
│   ├── checkout/         # Checkout & Razorpay Integration
│   ├── shop/             # Product Catalog
│   ├── track/            # Order Tracking Page
│   └── api/              # Next.js Proxy API routes
├── components/           # Reusable React Components (Navbar, Footer, CartDrawer, etc.)
├── lib/                  # Frontend logic & Static Product Data (products.ts)
├── public/               # Static assets (Images, Logos)
├── .env.local            # Master Environment Variables (Keys, DB URL, SMTP)
└── backend/              # FastAPI Python Backend
    ├── app/
    │   ├── database/     # SQLAlchemy connection & session handling
    │   ├── models/       # Database Schema (User, Order, Tracking, etc.)
    │   ├── routes/       # API Endpoints (Auth, Orders, Admin, Payment)
    │   ├── delivery_service.py  # Delhivery API integration logic
    │   └── main.py       # FastAPI application entry point
    └── seed_products.py  # Script to populate/update database pricing & catalog
```

---

## 🛠️ Local Setup & Development

### 1. Environment Variables
All secret keys are managed centrally in `website/.env.local`. It contains:
- `DATABASE_URL` (Neon PostgreSQL)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- `DELHIVERY_API_KEY` & Pickup details
- `SMTP` settings for email notifications
- `JWT_SECRET`

### 2. Run the Backend (FastAPI)
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --port 5000 --reload
```

### 3. Run the Frontend (Next.js)
Open a new terminal:
```bash
npm run dev
```
The website will be available at `http://localhost:3000`.

### 4. Database Seeding
If you change product prices or add new combos in `lib/products.ts`, sync them to the database by running:
```bash
cd backend
python seed_products.py
```
