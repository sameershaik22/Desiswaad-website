# DesiSwad Foods – Premium E-Commerce Website

A full-stack e-commerce website for DesiSwad Foods, selling authentic Telangana homemade snacks. The site will support Indian and international customers with Razorpay payment integration, WhatsApp ordering, and a polished premium brand experience.

---

## User Review Required

> [!IMPORTANT]
> **Technology Stack Decision:** For a full frontend + backend site, I recommend using **Next.js 14** (App Router) for the frontend + **Node.js/Express** REST API backend + **SQLite** (via better-sqlite3) for the database — no cloud services required, runs locally. This allows a real working full-stack app on your machine.

> [!WARNING]
> **Razorpay Test Keys:** The payment gateway will use Razorpay TEST mode by default. You will need to provide your Razorpay Key ID and Key Secret from your Razorpay dashboard to go live. I'll use placeholder test keys that you can swap in `.env`.

> [!IMPORTANT]
> **COD vs Prepaid Logic:** Indian customers will see UPI/Card/Netbanking + COD options. International customers (non-Indian phone/address) will be prompted for card-only prepaid checkout. This will be enforced in the checkout flow.

---

## Proposed Changes

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, React 18) |
| Styling | Vanilla CSS + CSS Variables (Brand colors) |
| Backend API | Node.js + Express (runs alongside Next.js) |
| Database | SQLite via `better-sqlite3` |
| Payments | Razorpay SDK |
| Images | Generated placeholder images + next/image |
| Deployment | Local dev (`npm run dev`) |

---

### Project Structure

```
website/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home page
│   ├── about/page.tsx          # About Us
│   ├── shop/page.tsx           # Shop / Products
│   ├── shop/[slug]/page.tsx    # Individual product page
│   ├── cart/page.tsx           # Cart page
│   ├── checkout/page.tsx       # Checkout with Razorpay
│   ├── track/page.tsx          # Order tracking
│   └── contact/page.tsx        # Contact + WhatsApp
├── components/                 # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   ├── HeroBanner.tsx
│   ├── WhatsAppButton.tsx
│   └── CategoryFilter.tsx
├── server/                     # Express backend
│   ├── index.js                # API server entry
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── payment.js
│   └── db/
│       ├── schema.sql
│       └── seed.js             # Sample products + data
├── lib/                        # Shared utilities
│   ├── store.ts                # Cart state (Zustand)
│   ├── api.ts                  # API client
│   └── razorpay.ts
├── public/
│   └── images/                 # Generated product images
├── styles/
│   └── globals.css             # Brand design system
├── .env.local                  # Razorpay keys, API URL
├── package.json
└── next.config.js
```

---

### Pages

#### [NEW] Home Page (`app/page.tsx`)
- Full-width hero banner with brand tagline "Pure Taste • Pure Trust"
- Featured products carousel (6 products)
- Brand story snippet
- Category quick-links (Chekodi, Khara Mixture, Achappam, etc.)
- Trust badges (100% Homemade, Pan-India Shipping, Secure Payment)
- Instagram/social feed section

#### [NEW] About Us (`app/about/page.tsx`)
- Brand story with traditional imagery
- Mission & values
- Founder story
- Quality guarantee section

#### [NEW] Shop (`app/shop/page.tsx`)
- Product grid with category filters (sidebar + mobile drawer)
- Sort by: Price, Popularity, New Arrivals
- Search bar
- Pagination

#### [NEW] Product Detail (`app/shop/[slug]/page.tsx`)
- Large product image gallery
- Description, ingredients, weight options (250g, 500g, 1kg)
- Add to cart with quantity selector
- Related products
- Reviews section (static for now)

#### [NEW] Cart (`app/cart/page.tsx`)
- Cart items with quantity adjust and remove
- Order summary with shipping estimate
- Coupon code field (placeholder)

#### [NEW] Checkout (`app/checkout/page.tsx`)
- Address form (India vs International detection)
- Indian customers: UPI, Card, Net Banking, COD
- International customers: Card only (prepaid)
- Razorpay payment popup integration
- Order confirmation on success

#### [NEW] Order Tracking (`app/track/page.tsx`)
- Enter order ID or phone number
- Real-time order status display (Placed → Processing → Shipped → Delivered)

#### [NEW] Contact (`app/contact/page.tsx`)
- Contact form
- WhatsApp direct link
- Google Maps embed (placeholder)
- Business hours

---

### Backend API

#### [NEW] `server/index.js`
Express server running on port 5000 (proxied through Next.js).

#### [NEW] `server/routes/products.js`
- `GET /api/products` – list all products (with filters)
- `GET /api/products/:slug` – single product

#### [NEW] `server/routes/orders.js`
- `POST /api/orders` – create order
- `GET /api/orders/:id` – track order
- `PATCH /api/orders/:id` – update status

#### [NEW] `server/routes/payment.js`
- `POST /api/payment/create-order` – create Razorpay order
- `POST /api/payment/verify` – verify Razorpay signature

---

### Database (SQLite)

**Tables:**
- `products` – id, name, slug, description, price, category, image_url, weight_options, stock
- `orders` – id, customer_name, phone, email, address, country, items (JSON), total, payment_mode, payment_status, order_status, created_at
- `order_tracking` – id, order_id, status, message, timestamp

**Seed Data (Sample Products):**
| Product | Category | Price (500g) |
|---------|---------|------|
| Chekodi | Namkeen | ₹180 |
| Khara Mixture | Namkeen | ₹160 |
| Achappam | Sweet Snacks | ₹200 |
| Janthikalu | Namkeen | ₹170 |
| Murukku | Namkeen | ₹150 |
| Boondi | Namkeen | ₹140 |

---

### Design System

**Brand Colors (CSS Variables):**
```css
--color-red: #B22222;
--color-green: #1E5B3A;
--color-gold: #D4AF37;
--color-cream: #F7F3E9;
```

**Typography:** Google Fonts – `Playfair Display` (headings) + `Inter` (body)

**Key Design Elements:**
- Full-width hero with gradient overlay on brand imagery
- Glassmorphism cards for product display
- Gold accent borders and highlights
- Smooth hover animations on all interactive elements
- WhatsApp floating button (bottom-right)
- Sticky header with cart icon + count badge

---

## Open Questions

> [!IMPORTANT]
> 1. **Razorpay Keys**: Do you have Razorpay API credentials? I'll use test mode keys by default — you can swap them in `.env.local` later.

> [!IMPORTANT]
> 2. **COD Availability**: Should COD be available for all Indian states, or restricted to specific pincodes/states?

> [!IMPORTANT]
> 3. **Shipping Charges**: What is your shipping rate structure? (e.g., free above ₹500, flat ₹60 otherwise?) I'll use a placeholder that you can adjust.

> [!IMPORTANT]
> 4. **WhatsApp Number**: What is the WhatsApp business number for order inquiries? I'll use a placeholder `+91-XXXXXXXXXX`.

> [!IMPORTANT]
> 5. **Google Maps**: Do you have a physical store/kitchen address for the Google Maps embed?

---

## Verification Plan

### Automated Dev Server
```bash
npm run dev         # Next.js frontend on :3000
node server/index.js   # Express API on :5000
```

### Manual Verification
- Browse all pages in browser
- Add items to cart and go through checkout
- Test Razorpay payment in test mode
- Test order tracking by order ID
- Verify WhatsApp button links correctly
- Check mobile responsiveness
- Verify COD shows only for Indian addresses
