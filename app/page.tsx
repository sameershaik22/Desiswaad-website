import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DesiSwad Foods – Authentic Telangana Homemade Snacks | Pure Taste • Pure Trust',
  description: 'Shop authentic handmade Telangana snacks: Chekodi, Khara Mixture, Achappam and more. Fresh, traditional recipes. Pan-India and international delivery.',
};

const TRUST_BADGES = [
  { icon: '🏡', title: '100% Homemade', desc: 'Made fresh in our traditional kitchen' },
  { icon: '🚚', title: 'Pan-India Delivery', desc: 'Fast shipping to all states' },
  { icon: '🌍', title: 'International Orders', desc: 'Shipping worldwide' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay, UPI, COD available' },
];

const CATEGORIES = [
  { name: 'Namkeen', displayName: 'Namkeen', emoji: '🌶️', desc: 'Spicy & Savoury Snacks', count: '3 Items' },
  { name: 'Combos', displayName: 'Combo Packs', emoji: '📦', desc: 'Value Combo Packs', count: '4 Items' },
  { name: 'Gift Hampers', displayName: 'Gift Hampers', emoji: '🎁', desc: 'Festival Special Packs', count: 'Coming Soon' },
];

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 6);
  const bestsellers = PRODUCTS.filter(p => p.bestseller);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340';

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__bg">
          <Image src="/hero_banner.png" alt="Authentic Telangana Snacks" fill style={{ objectFit: 'cover' }} priority />
          <div className="hero__overlay" />
        </div>
        <div className="container hero__content">
          <div className="hero__text">
            <span className="hero__label">🌶️ Authentic • Homemade • Traditional</span>
            <h1 className="hero__title">
              The Real Taste of<br />
              <span className="hero__title-highlight">Telangana</span>
            </h1>
            <p className="hero__subtitle">
              Handmade Telangana Snacks<br />
              Freshly prepared in small batches using traditional recipes. Delivered across India
            </p>
            <div className="hero__tagline">Pure Taste • Pure Trust</div>
            <div className="hero__actions">
              <Link href="/shop" className="btn btn-gold btn-lg">🛒 Shop Now</Link>
              <a href={`https://wa.me/${whatsapp}?text=Hi! I'd like to order from DesiSwad Foods.`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg hero__wa-btn">
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="hero__scroll"><div className="hero__scroll-dot" /></div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="trust-item">
                <span className="trust-item__icon">{b.icon}</span>
                <div>
                  <p className="trust-item__title">{b.title}</p>
                  <p className="trust-item__desc">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BESTSELLERS ===== */}
      <section className="section" style={{ background: '#fff', paddingTop: '64px' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Most Loved</span>
              <h2 className="heading-lg">Bestselling Snacks</h2>
              <div className="gold-line-left" />
            </div>
            <Link href="/shop" className="btn btn-outline">View All →</Link>
          </div>
          <div className="products-grid">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ===== ALL PRODUCTS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-label">Fresh &amp; Handmade</span>
              <h2 className="heading-lg">All Our Snacks</h2>
              <div className="gold-line-left" />
            </div>
            <Link href="/shop" className="btn btn-outline">View All →</Link>
          </div>
          <div className="products-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section" style={{ background: '#fff', paddingTop: '64px' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 40 }}>
            <span className="section-label">Browse By Type</span>
            <h2 className="heading-lg">Our Snack Collections</h2>
            <div className="gold-line" />
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href={`/shop${cat.name !== 'Gift Hampers' ? `?category=${encodeURIComponent(cat.name)}` : ''}`} className="cat-card">
                <span className="cat-card__emoji">{cat.emoji}</span>
                <h3 className="cat-card__name">{cat.displayName}</h3>
                <p className="cat-card__desc">{cat.desc}</p>
                <span className="cat-card__count">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRAND STORY STRIP ===== */}
      <section className="story-strip">
        <div className="container">
          <div className="story-strip__inner">
            <div className="story-strip__img">
              <Image src="/about_banner.png" alt="Our Kitchen Story" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className="story-strip__content">
              <span className="section-label">Our Story</span>
              <h2 className="heading-lg" style={{ color: '#fff' }}>Made with Love,<br />Served with Pride</h2>
              <div className="gold-line-left" />
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: 28 }}>
                DesiSwad Foods was born from a passion for preserving authentic Telangana culinary traditions. Every snack is handcrafted using time-tested family recipes, the finest ingredients, and no artificial preservatives.
              </p>
              <Link href="/about" className="btn btn-gold">Learn Our Story →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">Simple &amp; Easy</span>
            <h2 className="heading-lg">How to Order</h2>
            <div className="gold-line" />
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '🛒', title: 'Choose Your Snacks', desc: 'Browse our collection and pick your favourites' },
              { step: '02', icon: '📦', title: 'Select Pack Size', desc: 'Choose from 250g, 500g or 1kg packs' },
              { step: '03', icon: '💳', title: 'Pay Securely', desc: 'UPI, cards, net banking or Cash on Delivery' },
              { step: '04', icon: '🚀', title: 'We Deliver', desc: 'Fresh snacks at your doorstep within 3–7 days' },
            ].map((s) => (
              <div key={s.step} className="step-card">
                <div className="step-card__num">{s.step}</div>
                <div className="step-card__icon">{s.icon}</div>
                <h4 className="step-card__title">{s.title}</h4>
                <p className="step-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-banner">
        <div className="container text-center">
          <span className="section-label" style={{ color: '#D4AF37' }}>Special Offer</span>
          <h2 className="heading-lg" style={{ color: '#fff', marginBottom: 12 }}>
            🎉 Free Shipping on Orders Above ₹499!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1.05rem' }}>
            Shop your favourite Telangana snacks and get them delivered for free across India.
          </p>
          <Link href="/shop" className="btn btn-gold btn-lg">Shop Now &amp; Save →</Link>
        </div>
      </section>
    </>
  );
}
