'use client';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#D4AF37', fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px' }}>📜 Terms & Conditions</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '1rem' }}>Last updated: June 11, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px 80px', color: '#333', lineHeight: 1.8 }}>
        <style>{`
          .legal-section { margin-bottom: 36px; }
          .legal-title { font-size: 1.3rem; fontWeight: 800; color: #1E5B3A; margin: 0 0 12px; border-bottom: 1.5px solid #eee; padding-bottom: 6px; }
          .legal-text { font-size: 0.95rem; color: #555; margin: 0 0 14px; }
          .legal-list { margin: 0 0 16px; padding-left: 20px; color: #555; font-size: 0.95rem; }
          .legal-list li { margin-bottom: 8px; }
        `}</style>

        <div className="legal-section">
          <p className="legal-text">
            Welcome to <strong>DesiSwad Foods</strong>! 
          </p>
          <p className="legal-text">
            These terms and conditions outline the rules and regulations for the use of DesiSwad Foods' Website, located at <Link href="/" style={{ color: '#1E5B3A', fontWeight: 600 }}>desiswadfoods.com</Link>.
          </p>
          <p className="legal-text">
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use DesiSwad Foods if you do not agree to take all of the terms and conditions stated on this page.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">1. Account Registration</h2>
          <p className="legal-text">
            To place an order or manage saved addresses, you may create an account. You are responsible for maintaining the confidentiality of your account password and token credentials, and for restricting access to your computer/device. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">2. Order Placement & Availability</h2>
          <p className="legal-text">
            All snack orders are subject to availability. Our items are handmade in fresh, small batches to preserve authenticity. 
          </p>
          <p className="legal-text">
            We reserve the right to refuse or cancel any order if inventory stock is unavailable. In such cases, if payment has already been completed, we will issue a full refund to your original payment method.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">3. Pricing & Payments</h2>
          <p className="legal-text">
            Prices for our products are subject to change without notice. We make every effort to display accurate pricing, but errors may occasionally occur.
          </p>
          <ul className="legal-list">
            <li><strong>Payment Modes:</strong> We support Online Payment (UPI, Cards, Net Banking via Razorpay) and Cash on Delivery (COD) for domestic deliveries in India.</li>
            <li><strong>COD Fee:</strong> A nominal charge of ₹30 applies to Cash on Delivery orders.</li>
            <li><strong>International Shipping:</strong> For international orders, payments must be completed online prior to dispatch (COD is not supported).</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">4. Shipping & Delivery</h2>
          <p className="legal-text">
            We ship pan-India and globally. Delivery times are estimates and start from the date of shipping.
          </p>
          <ul className="legal-list">
            <li>Domestic shipping is free for orders above ₹499. Below that, a flat ₹60 shipping fee applies.</li>
            <li>We dispatch snacks within 1–2 business days. Event tracking notifications will be shared via email and WhatsApp.</li>
            <li>We are not responsible for delays caused by customs clearances, holiday disruptions, or courier operational issues.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">5. Return & Replacement Conditions</h2>
          <p className="legal-text">
            Due to the perishable nature of food items, products are eligible for replacement, not return. 
          </p>
          <p className="legal-text">
            Replacement requests must be submitted within <strong>7 days of delivery</strong> via our online portal. Photographic proof of packaging damage or quality issues is required for approval. Please refer to our <Link href="/refund-policy" style={{ color: '#1E5B3A', fontWeight: 600 }}>Refund & Replacement Policy</Link> for details.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">6. Limitation of Liability</h2>
          <p className="legal-text">
            DesiSwad Foods and its associates will not be liable for any indirect, incidental, or consequential damages arising out of the use of or inability to use this website, including but not limited to food allergies if product ingredients were clearly listed on the packaging and product page.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid #eee' }}>
          <Link href="/shop" style={{ display: 'inline-block', padding: '12px 28px', background: '#1E5B3A', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
            🛒 Back to Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
