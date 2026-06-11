'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import CartDrawer from './CartDrawer';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const count = useCartStore((s) => s.count());
  const openCart = useCartStore((s) => s.openCart);
  const { user, isLoggedIn, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    router.push('/');
  };

  const loggedIn = isLoggedIn();

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          {/* Brand */}
          <Link href="/" className="navbar__brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="navbar__logo" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="DesiSwad Logo" className="navbar__logo-img" />
            </div>
            <div className="navbar__brand-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="navbar__brand-name">DesiSwad</span>
              <span className="navbar__brand-sub">Foods</span>
            </div>
          </Link>

          {/* Nav Links */}
          <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
            <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
            <li><Link href="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link href="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link></li>
            <li><Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          </ul>

          {/* Right Actions */}
          <div className="navbar__actions">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__wa-btn"
              title="Order via WhatsApp"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Auth button / user dropdown */}
            {!mounted ? (
              <div style={{ width: 80, height: 32 }}></div>
            ) : loggedIn ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  title={user?.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.4)',
                    borderRadius: 20, padding: '6px 14px 6px 8px',
                    cursor: 'pointer', color: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1E5B3A,#2d7a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 800, fontSize: '0.85rem' }}>
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.65rem' }}>▾</span>
                </button>

                {accountOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%', background: '#fff',
                    borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                    border: '1px solid #eee', minWidth: 190, zIndex: 9999, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', background: '#f9fdf9' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#1E5B3A' }}>{user?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>{user?.email}</p>
                    </div>
                    <Link href="/my-orders" onClick={() => setAccountOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                      📦 My Orders
                    </Link>
                    <Link href="/my-orders/return" onClick={() => setAccountOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                      🔁 Report Issue
                    </Link>
                    <Link href="/saved-addresses" onClick={() => setAccountOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                      📍 Saved Addresses
                    </Link>
                    <button onClick={handleLogout}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', color: '#c62828', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                style={{
                  padding: '8px 16px', background: 'linear-gradient(135deg,#1E5B3A,#2d7a4f)',
                  color: '#fff', borderRadius: 20, fontWeight: 700, textDecoration: 'none',
                  fontSize: '0.82rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                🔑 Login
              </Link>
            )}

            <button
              className="navbar__cart-btn"
              onClick={openCart}
              id="nav-cart-btn"
              aria-label="Open Cart"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && <span className="navbar__cart-count">{count}</span>}
            </button>

            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer />

    </>
  );
}
