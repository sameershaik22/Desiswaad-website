'use client';
import { useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function ShopPage() {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(PRODUCTS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, []);

  useEffect(() => {
    let result = [...PRODUCTS];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price_asc') result.sort((a, b) => a.prices['500g'] - b.prices['500g']);
    else if (sort === 'price_desc') result.sort((a, b) => b.prices['500g'] - a.prices['500g']);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    setFiltered(result);
  }, [category, sort, search]);

  return (
    <>
      {/* Page Header */}
      <div className="shop-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Shop</span>
          </div>
          <h1 className="heading-lg">All Snacks</h1>
          <p className="shop-hero__sub">Fresh, handmade and packed with authentic Telangana flavours</p>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="sidebar-cats">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    className={`sidebar-cat-btn${category === cat ? ' sidebar-cat-btn--active' : ''}`}
                  >
                    <span>{cat}</span>
                    <span className="sidebar-cat-count">{cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card" style={{ marginTop: 20 }}>
            <h3 className="sidebar-title">Spice Level</h3>
            <ul className="sidebar-cats">
              {['Mild', 'Medium', 'Spicy'].map((s) => (
                <li key={s}>
                  <button className="sidebar-cat-btn" style={{ width: '100%', textAlign: 'left' }}>
                    <span>🌶️ {s}</span>
                    <span className="sidebar-cat-count">
                      {PRODUCTS.filter(p => p.spiceLevel === s).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp Order */}
          <div className="sidebar-wa">
            <p>💬 Need help choosing?</p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I need help choosing snacks.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{ background: '#25D366', color: '#fff', width: '100%', marginTop: 8 }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="shop-search-wrap">
              <svg width="16" height="16" fill="none" stroke="#9E9E9E" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                className="form-input shop-search"
                placeholder="Search snacks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="shop-search-input"
              />
            </div>
            <div className="shop-sort-wrap">
              <label htmlFor="shop-sort">Sort:</label>
              <select
                id="shop-sort"
                className="form-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: '10px 14px' }}
              >
                <option value="default">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Category pills - mobile */}
          <div className="shop-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shop-pill${category === cat ? ' shop-pill--active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="shop-results-count">
            Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'product' : 'products'}
            {category !== 'All' ? ` in "${category}"` : ''}
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="shop-empty">
              <span>🔍</span>
              <p>No snacks found. Try a different search or category.</p>
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setCategory('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      
    </>
  );
}
