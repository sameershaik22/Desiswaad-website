'use client';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#D4AF37', fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px' }}>🔄 Refund & Replacement Policy</h1>
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
          .highlight-box { background: #fdfbf7; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        `}</style>

        <div className="legal-section">
          <p className="legal-text">
            At <strong>DesiSwad Foods</strong>, we take immense pride in crafting authentic, fresh, and high-quality traditional snacks. Since our products are food items prepared without artificial preservatives, they are perishable. Because of this, we have tailored our Refund and Replacement policy to prioritize food safety while ensuring your complete satisfaction.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">1. Replacement & Return Window</h2>
          <p className="legal-text">
            Due to the perishable nature of homemade foods, products are **eligible for replacement, not return**. 
          </p>
          <div className="highlight-box">
            <p className="legal-text" style={{ margin: 0, fontWeight: 600, color: '#1E5B3A' }}>
              ⏱️ Replacement Request Period:
            </p>
            <p className="legal-text" style={{ margin: '4px 0 0' }}>
              All complaints and replacement requests must be registered within **7 days of delivery**. Requests received after this window cannot be accommodated.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">2. Eligible Circumstances for Replacement</h2>
          <p className="legal-text">
            We will gladly issue a free replacement or store credit under the following circumstances:
          </p>
          <ul className="legal-list">
            <li><strong>Quality Issues:</strong> Uncharacteristic taste, stale products, or signs of spoilage prior to the designated expiry date (assuming proper storage guidelines were followed).</li>
            <li><strong>Transit Damage:</strong> Severely crushed packaging, broken seals, or spilled contents upon delivery.</li>
            <li><strong>Incorrect Items:</strong> Receipt of products that do not match the items listed in your order confirmation.</li>
            <li><strong>Missing Items:</strong> Packages delivered with items missing from the packed list.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">3. How to Submit a Replacement Request</h2>
          <p className="legal-text">
            To submit a request, please follow our automated submission process:
          </p>
          <ul className="legal-list">
            <li>Go to your **My Orders** section (or use the link in your order confirmation email).</li>
            <li>Select the order and click on **Request Return / Replacement**.</li>
            <li>Choose the specific item(s) you wish to replace.</li>
            <li>Provide a description of the issue and upload **clear photographic or video evidence** of the damaged packaging, quality defect, or incorrect items.</li>
            <li>Submit the request. Our Quality Assurance team will review and respond within **24 to 48 hours**.</li>
          </ul>
          <p className="legal-text">
            Alternatively, if you face any issues with the automated system, you can contact our support team at <a href="mailto:desiswadfoods@evertrusttrading.com" style={{ color: '#1E5B3A', fontWeight: 600 }}>desiswadfoods@evertrusttrading.com</a> or message us on WhatsApp at **+91 9640497340** with your Order ID and photo proofs.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">4. Refund Credit Timeline</h2>
          <p className="legal-text">
            If a replacement is approved but the item is currently out of stock, or if you request a refund instead of a replacement:
          </p>
          <ul className="legal-list">
            <li>The refund will be initiated immediately upon approval.</li>
            <li>It will be credited back to your **original payment method** (credit card, debit card, UPI, or net banking) via our payment gateway partner, Razorpay.</li>
            <li>Refunds typically reflect in your account within **5 to 7 business days**, depending on your financial institution's processing cycle.</li>
            <li>For Cash on Delivery (COD) orders, our support team will contact you to collect bank account details or a UPI ID to transfer the refund electronically.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">5. Non-Eligible Items and Exceptions</h2>
          <p className="legal-text">
            We cannot issue replacements or refunds under the following conditions:
          </p>
          <ul className="legal-list">
            <li>Incorrect shipping address provided during checkout, leading to delivery delays or failure.</li>
            <li>Refusal to accept delivery of the shipment without reasonable cause.</li>
            <li>Snacks stored improperly after delivery (e.g., exposed to direct sunlight, humidity, or pests).</li>
            <li>Minor differences in shape, size, or color, as all our snacks are individually handmade.</li>
          </ul>
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
