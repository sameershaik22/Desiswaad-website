# 🌿 DesiSwad Foods — Premium Full-Stack E-Commerce Platform

Welcome to the **DesiSwad Foods** master repository! 
This is a high-performance, fully-featured snack e-commerce platform custom-built to deliver authentic Telangana snacks. It features a modern Next.js App Router frontend, a robust Python FastAPI backend, and a cloud-native Neon PostgreSQL database.

---

## 🚀 Quick Start: How to Run the Project Locally

To get the platform running on your local machine, you need to run both the backend API and the frontend website simultaneously.

### Step 1: Database Setup (Neon PostgreSQL)
Ensure your `backend/.env` file has the correct Neon DB connection string. The platform will automatically connect to it.
```env
DATABASE_URL=postgresql://user:password@your-neon-hostname.aws.neon.tech/dbname?sslmode=require
```

### Step 2: Run the FastAPI Backend
Open **Terminal 1**:
```powershell
cd website/backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```
✅ *The backend API is now running at **http://localhost:5000***.
✅ *You can view the interactive API testing dashboard at **http://localhost:5000/docs***.

### Step 3: Run the Next.js Frontend
Open **Terminal 2**:
```powershell
cd website
npm install
npm run dev
```
✅ *The frontend website is now running at **http://localhost:3000***.

---

## 📦 Master Technology Stack

| Layer | Technology Used | Purpose |
|-------|----------------|---------|
| **Frontend Framework** | **Next.js 16 (App Router)** | Server-side rendering, SEO, and fast page loads |
| **UI & Components** | **React & TypeScript** | Type-safe, interactive, and reusable UI components |
| **Styling** | **Vanilla CSS (Globals/Modules)** | Custom, high-performance bespoke design (No Tailwind bloat) |
| **State Management**| **Zustand** | Lightweight global state for Shopping Cart and User Auth |
| **Backend API** | **Python 3.12 + FastAPI** | High-speed, typed backend processing |
| **Database** | **Neon PostgreSQL** | Cloud-native, scalable relational database |
| **ORM** | **SQLAlchemy** | Secure database querying and modeling |
| **Payments Gateway** | **Razorpay** | Secure online checkout integration |
| **Automated Emails** | **Nodemailer + Gmail SMTP** | Transactional emails (Order Confirmed, Shipped, etc.) |
| **Authentication** | **JWT + bcrypt + Google OAuth** | Secure user login, password hashing, and token verification |

---

## ✨ Complete Feature List & Platform Capabilities

### 🛍️ Customer Experience (Public & Authenticated Pages)
- **`/` (Homepage):** Stunning hero section, category showcases, best-selling snacks carousel, and dynamic premium animations.
- **`/shop` (Product Listing):** Complete catalog displaying snacks, prices, weights, and instant "Add to Cart" functionality.
- **`/cart` (Shopping Cart):** Slide-out interactive Cart Drawer showing selected items, total calculations, and quick checkout routing.
- **`/checkout` (Checkout Flow):** Secure 3-step checkout process capturing addresses and offering both **Cash on Delivery (COD)** and **Online Payments (Razorpay)**. Automatically calculates shipping fees and COD convenience fees.
- **`/login` & `/signup` (Authentication):** Dual login system. Users can sign up securely with an email/password or use 1-click **Google OAuth**.
- **`/contact` & `/about`:** Brand storytelling and customer support forms.
- **Floating WhatsApp Integration:** A persistent, floating chat button on the bottom right that links directly to customer support via WhatsApp.

### 📦 The "My Orders" Dashboard (`/my-orders`)
A highly advanced, Amazon-style customer dashboard.
- **Liquid Flow Timeline:** Visual, animated tracking of order status (`Placed` → `Confirmed` → `Preparing` → `Shipped` → `Delivered`).
- **Amazon-Style Return Policy Engine:** 
  - Strict 24-hour return window specifically designed for perishable food items.
  - Displays a live countdown timer (`Xh Ym remaining`) that turns **orange** under 6 hours and **red** under 1 hour.
  - **Auto-Expiry:** Exactly 24 hours after delivery, the return button vanishes and is replaced with a permanent policy rejection notice. The backend strictly enforces this.
- **Intelligent Review System:** Customers can leave star ratings and text reviews exclusively on delivered products. Once submitted, the system transforms the button into a permanent, unclickable `✓ Reviewed` badge to prevent spam.
- **Action Hub:** Features quick-access buttons to print invoices, view live tracking radar, or instantly reorder previous snacks.

### 🛡️ Private Admin Command Center (`/admin`)
A heavily restricted dashboard for store owners.
- **Next.js Route Protection:** The public Navbar, Footer, and WhatsApp buttons are automatically purged from the UI when on the `/admin` route to provide a clean, software-like experience.
- **Order Management Console:** View all incoming orders, filter by status, see customer details, and update fulfillment statuses.
- **Automated Email Triggers:** When an admin changes an order status to "Shipped" or "Delivered", the FastAPI backend automatically dispatches a beautiful HTML email to the customer.
- **Return Approvals:** Admins can review customer return requests, read the provided reasons, and issue Approvals or Rejections.
- **Revenue Analytics:** Live top-level metrics showing Total Sales (₹), Total Orders, and Pending Return Requests.

---

## 📂 Complete Project Architecture

```text
website/
│
├── app/                         ← Next.js Frontend Pages
│   ├── page.tsx                 ← Homepage
│   ├── layout.tsx               ← Root layout (Navbar/Footer dynamically hidden on /admin)
│   ├── shop/                    ← Product catalog
│   ├── cart/                    ← Shopping cart
│   ├── checkout/                ← Checkout process
│   ├── login/                   ← Auth flows
│   ├── my-orders/               ← Customer dashboard & return tracking
│   ├── track/                   ← Public tracking link page
│   └── admin/                   ← Private Admin dashboard
│
├── components/                  ← Reusable UI Components
│   ├── Navbar.tsx               ← Main top navigation
│   ├── Footer.tsx               ← Main footer
│   ├── ProductCard.tsx          ← Reusable snack card
│   └── WhatsAppButton.tsx       ← Floating chat support
│
├── backend/                     ← ⭐ MAIN BACKEND (FastAPI)
│   ├── main.py                  ← FastAPI server entry point
│   ├── migrate_delivered_at.py  ← Custom DB Migration scripts
│   ├── requirements.txt         ← Python dependencies
│   └── app/
│       ├── database/database.py ← Neon PostgreSQL connection
│       ├── models/models.py     ← SQLAlchemy ORM models
│       ├── routes/              ← API Endpoints (Admin, Orders, Returns, Reviews, Auth)
│       └── schemas/             ← Pydantic validation schemas
│
├── .env.local                   ← Next.js frontend environment variables
├── backend/.env                 ← FastAPI backend environment variables
└── database_schema.sql          ← Reference SQL schema document
```

---

## 🗄️ Database Schema (Neon PostgreSQL)

The platform is powered by a robust, normalized relational database.
- **`users`**: Customer accounts, hashed passwords, names, and contact details.
- **`products`**: The master snack catalog (prices, weights, categories, image URLs).
- **`orders`**: Core order ledger containing grand totals, shipping addresses, payment methods, and precise `delivered_at` timestamps for return tracking.
- **`order_items`**: Individual line items linked to each `order_id`.
- **`tracking`**: An append-only historical timeline of every status change an order has ever gone through.
- **`reviews`**: Product ratings and text reviews left by verified purchasers.
- **`return_requests`**: Details of return requests (reason, status, admin notes).

---

## 🔑 Environment Variables Guide

To ensure the platform runs securely, the following `.env` files must be populated.

### 1. `.env.local` (Located in the root `website/` folder)
```env
# URL where your FastAPI backend is running
NEXT_PUBLIC_API_URL=http://localhost:5000

# WhatsApp support number (Used by floating button and checkout)
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX

# Secret for decoding JWT tokens on the frontend side
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth Client ID for Login integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Razorpay public key for online checkout popups
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
```

### 2. `backend/.env` (Located in the `website/backend/` folder)
```env
# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@your-neon-hostname.aws.neon.tech/dbname?sslmode=require

# Security Secrets
ADMIN_SECRET=your_admin_secret_here
JWT_SECRET=your_super_secret_jwt_key_here

# Gmail SMTP for sending automated order emails to customers
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_16_char_app_password_here

# Razorpay backend verification keys (Required to confirm payments)
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
```
