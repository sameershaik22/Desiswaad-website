'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="footer__logo-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="DesiSwad Logo" style={{ height: '56px', width: 'auto', objectFit: 'contain', background: 'white', borderRadius: '12px', padding: '4px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="footer__brand-name">DesiSwad Foods</div>
                <div className="footer__tagline" style={{ display: 'block', marginTop: '2px' }}>Pure Taste • Pure Trust</div>
              </div>
            </div>
            <p className="footer__desc">
              Authentic Telangana homemade snacks crafted with love, tradition and the finest ingredients. Bringing the taste of home to your doorstep.
            </p>
            <div className="footer__socials">
              <a href="https://www.instagram.com/desiswadfoods?igsh=MWZobnV2amdmcDRjcw==" className="footer__social" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61587491174610&mibextid=rS40aB7S9Ucbxw6v" className="footer__social" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}`} className="footer__social footer__social--wa" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
              <a href="https://share.google/zAaSNW2xsFBq1ZG5v" className="footer__social footer__social--google" aria-label="Google" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.388-2.875-6.388-6.388 0-3.513 2.875-6.388 6.388-6.388 1.625 0 3.109.615 4.254 1.72l3.123-3.123C19.349 2.502 16.031 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.207 0 11.24-5.033 11.24-11.24 0-.78-.09-1.53-.25-2.25H12.24z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__col-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop All Snacks</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/track">Track My Order</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer__col">
            <h4 className="footer__col-title">Our Snacks</h4>
            <ul className="footer__col-links">
              <li><Link href="/shop?category=Namkeen">Namkeen</Link></li>
              <li><Link href="/shop?category=Sweet+Snacks">Sweet Snacks</Link></li>
              <li><Link href="/shop">Bestsellers</Link></li>
              <li><Link href="/shop">Festival Packs</Link></li>
              <li><Link href="/shop">Gift Hampers</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact Us</h4>
            <ul className="footer__contact-list">
              <li>
                <span>📞</span>
                <a href="tel:+919640497340">+91 9640497340</a>
              </li>
              <li>
                <span>📧</span>
                <a href="mailto:support@desiswadfoods.com">support@desiswadfoods.com</a>
              </li>
              <li>
                <span>📍</span>
                <span>Kaghaznagar, Viney Garden Opposite Lane, Gandhi Nagar 2, Telangana, Factory 504296</span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I'd like to order from DesiSwad Foods.`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__wa-cta"
            >
              💬 Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p>© 2024 DesiSwad Foods. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#888', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/privacy" style={{ color: '#888', transition: 'color 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" style={{ color: '#888', transition: 'color 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>Terms & Conditions</Link>
              <span>•</span>
              <Link href="/refund-policy" style={{ color: '#888', transition: 'color 0.2s', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>Refund Policy</Link>
            </div>
          </div>
          <p className="footer__bottom-right">
            <span>🔒 Secure Payments</span>
            <span>🚚 Pan-India Shipping</span>
            <span>🌍 International Delivery</span>
          </p>
        </div>
      </div>


    </footer>
  );
}
