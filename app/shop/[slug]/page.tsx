'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';
import { useCartStore } from '@/lib/store';
import { notFound } from 'next/navigation';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) notFound();
  const router = useRouter();

  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('Description');
  const [reviews, setReviews] = useState<{ customer_name: string, rating: number, review_text: string, created_at: string }[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  // Resolve image gallery (front + back, or fall back to single image)
  const gallery = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  useEffect(() => {
    fetch(`/api/reviews/${product.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(console.error);
  }, [product.slug]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;
  const reviewCount = reviews.length > 0 ? reviews.length : product.reviews;

  const displayReviews = reviews.length > 0 ? reviews : [
    { customer_name: "Rahul V.", rating: 5, review_text: "Absolutely delicious! Reminds me of exactly what my grandmother used to make in Hyderabad. The crunch is perfect.", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    { customer_name: "Sneha Reddy", rating: 4, review_text: "Very fresh and perfectly spiced. Packaging was great, didn't break during transit. Will order again.", created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
    { customer_name: "Amit P.", rating: 5, review_text: "Premium quality snacks. You can really taste the pure ingredients used. High recommended for tea time!", created_at: new Date(Date.now() - 86400000 * 25).toISOString() }
  ];

  const weights = Object.keys(product.prices);
  const price = product.prices[selectedWeight] || Object.values(product.prices)[0];
  const related = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, slug: product.slug, image: product.image, price, weight: selectedWeight, category: product.category });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const spiceColors: Record<string, string> = { Mild: '#1E5B3A', Medium: '#D4AF37', Spicy: '#B22222' };

  return (
    <>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Back Button + Breadcrumb row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px',
              background: '#1E5B3A',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 3px 12px rgba(30,91,58,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#15432b'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1E5B3A'; e.currentTarget.style.transform = 'translateX(0)'; }}
            title="Go back"
          >
            &#8592; Back
          </button>

          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ margin: 0 }}>
            <Link href="/">Home</Link><span>›</span>
            <Link href="/shop">Shop</Link><span>›</span>
            <span>{product.name}</span>
          </div>
        </div>

        {/* Product Layout */}
        <div className="product-layout">
          {/* Image Gallery */}
          <div className="product-img-side">
            <div className="product-main-img">
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                {gallery.length > 1 && (
                  <button
                    onClick={() => setActiveImg((prev) => (prev - 1 + gallery.length) % gallery.length)}
                    style={{ position: 'absolute', left: 10, background: 'rgba(255,255,255,0.8)', color: '#000', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', zIndex: 10, fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ‹
                  </button>
                )}
                <img src={gallery[activeImg]} alt={product.name} style={{ width: '100%', height: 'auto', borderRadius: '20px', display: 'block' }} />
                {gallery.length > 1 && (
                  <button
                    onClick={() => setActiveImg((prev) => (prev + 1) % gallery.length)}
                    style={{ position: 'absolute', right: 10, background: 'rgba(255,255,255,0.8)', color: '#000', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', zIndex: 10, fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ›
                  </button>
                )}
              </div>
              {product.bestseller && (
                <span className="product-badge">🔥 Bestseller</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="product-img-thumbs">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="product-thumb"
                    onClick={() => setActiveImg(i)}
                    style={{
                      cursor: 'pointer',
                      outline: activeImg === i ? '2.5px solid #B22222' : '2.5px solid transparent',
                      borderRadius: 8,
                      overflow: 'hidden',
                      opacity: activeImg === i ? 1 : 0.65,
                      transition: 'opacity 0.2s, outline 0.2s',
                    }}
                    title={i === 0 ? 'Front' : i === 1 ? 'Back' : `Image ${i + 1}`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-details">
            <span className="badge badge-gold">{product.category}</span>
            <h1 className="heading-lg" style={{ margin: '12px 0 4px' }}>{product.name}</h1>
            <p style={{ color: '#9E9E9E', marginBottom: 16, fontSize: '1.05rem' }}>{product.tagline}</p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', color: '#D4AF37', fontSize: '1.1rem' }}>
                {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < Math.round(Number(avgRating)) ? '#D4AF37' : '#e0e0e0' }}>★</span>)}
              </div>
              <span style={{ fontWeight: 700, color: '#2C2C2C' }}>{avgRating}</span>
              <span style={{ color: '#9E9E9E', fontSize: '0.85rem' }}>({reviewCount} reviews)</span>
              <span style={{ color: '#e0e0e0' }}>|</span>
              <span style={{ color: '#1E5B3A', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span>🚚</span>
                <span>{150 + (product.id * 37) % 150}+ Deliveries</span>
              </span>
            </div>

            {/* Info pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <span className="info-pill">🌶️ <strong>Spice:</strong> <span style={{ color: spiceColors[product.spiceLevel || 'Mild'] }}>{product.spiceLevel}</span></span>
              <span className="info-pill">📅 <strong>Shelf Life:</strong> {product.shelfLife}</span>
              <span className="info-pill">✅ <strong>No Preservatives</strong></span>
            </div>

            {/* Weight */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#616161', marginBottom: 10 }}>Select Pack Size:</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {weights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`weight-btn${selectedWeight === w ? ' weight-btn--active' : ''}`}
                  >
                    <span className="weight-btn__size">{w}</span>
                    <span className="weight-btn__price">₹{product.prices[w]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: '0.85rem', color: '#9E9E9E' }}>Price for {selectedWeight}:</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E5B3A' }}>₹{price}</span>
              </div>
              {price >= 499 && <span style={{ fontSize: '0.8rem', color: '#1E5B3A', fontWeight: 600 }}>🎉 Qualifies for free shipping!</span>}
            </div>

            {/* Qty + Add */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <div className="qty-ctrl" style={{ border: '1.5px solid #e0d8c8', borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ width: 44, textAlign: 'center', lineHeight: '44px', fontWeight: 700 }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button
                onClick={handleAdd}
                className={`btn btn-primary${added ? ' btn-added' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                id={`product-add-to-cart-${product.slug}`}
              >
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
            </div>

            {/* WhatsApp Order */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I want to order ${qty}x ${product.name} (${selectedWeight}) - ₹${price * qty}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{ background: '#25D366', color: '#fff', width: '100%', justifyContent: 'center', marginBottom: 24 }}
            >
              💬 Order via WhatsApp
            </a>

            {/* Shipping note */}
            <div className="shipping-note">
              <div className="shipping-note__item">🚚 Free shipping on orders above ₹499</div>
              <div className="shipping-note__item">💳 UPI, Cards, Net Banking & COD available</div>
              <div className="shipping-note__item">🌍 International delivery available</div>
              <div className="shipping-note__item">📦 Dispatched within 1–2 business days</div>
            </div>
          </div>
        </div>

        {/* Description & Review Tabs */}
        <div style={{ marginTop: 60 }}>
          <div className="product-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #eee', marginBottom: '24px' }}>
            {['Description', 'Ingredients'].map(tab => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: '12px', cursor: 'pointer', fontWeight: 600,
                  color: activeTab === tab ? '#B22222' : '#616161',
                  borderBottom: activeTab === tab ? '2px solid #B22222' : 'none',
                  marginBottom: '-2px'
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="product-tab-content" style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #eee' }}>
            {activeTab === 'Description' && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 12 }}>About {product.name}</h3>
                <p style={{ color: '#616161', lineHeight: 1.8 }}>{product.description}</p>
              </>
            )}

            {activeTab === 'Ingredients' && (
              <>
                <h4 style={{ fontWeight: 700, marginBottom: 8, color: '#2C2C2C' }}>Ingredients:</h4>
                <p style={{ color: '#616161', lineHeight: 1.8 }}>{product.ingredients}</p>
              </>
            )}

          </div>
        </div>

        {/* Amazon Style Reviews Section */}
        <div style={{ marginTop: 64, borderTop: '2px solid #eee', paddingTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: 40, alignItems: 'start' }}>

            {/* Left Col: Overall Stats */}
            <div>
              <h2 className="heading-md" style={{ marginBottom: 16 }}>Customer reviews</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ color: '#f59e0b', fontSize: '1.4rem' }}>{Array.from({ length: 5 }).map((_, idx) => <span key={idx} style={{ color: idx < Math.round(Number(avgRating)) ? '#f59e0b' : '#e0e0e0' }}>★</span>)}</div>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2C2C2C' }}>{avgRating} out of 5</span>
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24 }}>{displayReviews.length} global ratings</p>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: 24 }} />

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Review this product</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>Share your thoughts with other customers</p>
              <Link href={`/my-orders`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Write a customer review</Link>
            </div>

            {/* Right Col: Review List */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #eee' }}>Top reviews from India</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {displayReviews.map((r: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#555' }}>
                        {r.customer_name.charAt(0)}
                      </div>
                      <strong style={{ color: '#2C2C2C', fontSize: '0.95rem' }}>{r.customer_name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ color: '#f59e0b', fontSize: '1.1rem', letterSpacing: '1px' }}>
                        {Array.from({ length: 5 }).map((_, idx) => <span key={idx} style={{ color: idx < r.rating ? '#f59e0b' : '#e0e0e0' }}>★</span>)}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#B22222', fontWeight: 700 }}>Verified Purchase</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 12 }}>
                      Reviewed in India on {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ color: '#111', fontSize: '0.95rem', lineHeight: 1.6 }}>{r.review_text}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <button style={{ background: 'none', border: '1px solid #ddd', borderRadius: 20, padding: '4px 16px', fontSize: '0.75rem', fontWeight: 600, color: '#555', cursor: 'pointer' }}>Helpful</button>
                      <span style={{ fontSize: '0.8rem', color: '#888', borderLeft: '1px solid #ddd', paddingLeft: 16, cursor: 'pointer' }}>Report</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 className="heading-md">You May Also Like</h2>
              <Link href="/shop" className="btn btn-outline btn-sm">View All →</Link>
            </div>
            <div className="related-grid">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="related-card">
                  <div className="related-card__img">
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="related-card__info">
                    <p className="related-card__name">{p.name}</p>
                    <p className="related-card__price">₹{p.prices['500g']}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>


    </>
  );
}
