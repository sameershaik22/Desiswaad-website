# 🚀 DesiSwad Foods — Deployment Guide

Deploy frontend to **Vercel**, backend to **Railway**, database to **Neon** (all free tiers).

---

## Step 1 — Set Up Neon Database (Free PostgreSQL)

1. Go to **[neon.tech](https://neon.tech)** and create a free account
2. Click **"New Project"** → give it any name (e.g. `desiswad`)
3. After creation, go to **"Connection Details"** on the dashboard
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://samee:password@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **Tables are created automatically** when the backend starts — no manual SQL needed ✅

---

## Step 2 — Deploy Backend to Railway

1. Go to **[railway.app](https://railway.app)** and sign up (use GitHub login)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select your repository
4. Railway will detect it's a Node.js app

### Set the Start Command in Railway:
In Railway project → Settings → **Deploy** → set:
```
node server/index.js
```

### Set Environment Variables in Railway:
Go to your Railway service → **Variables** → add ALL of these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | *(paste your Neon connection string)* |
| `JWT_SECRET` | *(a long random string — 32+ chars)* |
| `FRONTEND_URL` | *(your Vercel URL — fill after Step 3)* |
| `NEXT_PUBLIC_SITE_URL` | *(your Vercel URL)* |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `919640497340` |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | *(your admin password)* |
| `GMAIL_USER` | *(your Gmail address)* |
| `GMAIL_PASS` | *(your Gmail App Password)* |
| `RAZORPAY_KEY_ID` | *(optional — for online payments)* |
| `RAZORPAY_KEY_SECRET` | *(optional — for online payments)* |

5. Railway will give you a URL like: `https://desiswad-api.up.railway.app`
6. **Copy this URL** — you need it for Step 3

---

## Step 3 — Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign up (use GitHub login)
2. Click **"Add New Project"** → import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: leave blank (`.`)

### Set Environment Variables in Vercel:
Go to your Vercel project → **Settings** → **Environment Variables** → add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | *(your Railway backend URL, e.g. `https://desiswad-api.up.railway.app`)* |
| `NEXT_PUBLIC_SITE_URL` | *(your Vercel URL, e.g. `https://desiswad.vercel.app`)* |
| `NEXT_PUBLIC_SITE_NAME` | `DesiSwad Foods` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `919640497340` |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | *(your admin password)* |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | *(optional)* |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(your Google OAuth Client ID)* |

5. Click **Deploy** — Vercel builds and deploys automatically
6. You get a URL like: `https://desiswad.vercel.app`

---

## Step 4 — Update FRONTEND_URL in Railway

Now that you have your Vercel URL:
1. Go back to Railway → Variables
2. Update `FRONTEND_URL` = `https://desiswad.vercel.app` (your actual Vercel URL)
3. Railway auto-redeploys

---

## Step 5 — Update Google OAuth (for Google Login)

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. APIs & Services → Credentials → click your OAuth 2.0 Client
3. Under **Authorized JavaScript origins**, add:
   ```
   https://desiswad.vercel.app
   ```
4. Save

---

## ✅ Verification

Open your Vercel URL and test:
- [ ] Homepage loads with products
- [ ] Can add items to cart
- [ ] Can sign up / log in
- [ ] Can place an order (COD)
- [ ] Admin dashboard works at `/admin`

---

## 🔄 Local Development After Deployment

For local dev, keep using:
```
npm run server    ← Express backend (localhost:5000)
npm run dev       ← Next.js frontend (localhost:3000)
```

Your `.env.local` already has `DATABASE_URL` pointing to Neon, so **both local and production use the same Neon database**.

> ⚠️ If you want separate dev/prod databases, create two Neon projects and use different `DATABASE_URL` values.

---

## 🆓 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| **Vercel** | Unlimited deploys, 100GB bandwidth/month |
| **Railway** | $5 credit/month (enough for ~500 hours) |
| **Neon** | 0.5 GB storage, 190 compute hours/month |
