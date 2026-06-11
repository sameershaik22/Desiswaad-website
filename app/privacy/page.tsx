'use client';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#D4AF37', fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px' }}>🔒 Privacy Policy</h1>
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
            At <strong>DesiSwad Foods</strong>, accessible from <Link href="/" style={{ color: '#1E5B3A', fontWeight: 600 }}>desiswadfoods.com</Link>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DesiSwad Foods and how we use it.
          </p>
          <p className="legal-text">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">1. Information We Collect</h2>
          <p className="legal-text">
            We collect information from you when you register on our site, place an order, subscribe to our newsletter, or fill out a form. 
          </p>
          <ul className="legal-list">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address.</li>
            <li><strong>Account Credentials:</strong> Hashed password (or Google profile tokens if you authenticate using Google Sign-In).</li>
            <li><strong>Order Details:</strong> Items purchased, order total, purchase date, payment mode, and delivery status.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and access times.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">2. How We Use Your Information</h2>
          <p className="legal-text">
            Any of the information we collect from you may be used in one of the following ways:
          </p>
          <ul className="legal-list">
            <li>To process and confirm your transactions and send order status emails.</li>
            <li>To personalize your experience and better respond to your individual needs.</li>
            <li>To improve our website offering based on your feedback and technical interactions.</li>
            <li>To link past guest orders automatically once you register with the same email.</li>
            <li>To send periodic customer support updates, transaction emails, and promotional offers.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">3. Data Security and Protection</h2>
          <p className="legal-text">
            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
          </p>
          <p className="legal-text">
            We use secure server hosting, database encryption, and secure APIs. Password hashes are stored using highly secure hashing algorithms (bcrypt). We do not store full credit card/debit card details on our servers; all payments are processed securely via our trusted payment partner, <strong>Razorpay</strong>, using standard SSL encryption.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">4. Third-Party Disclosures</h2>
          <p className="legal-text">
            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential:
          </p>
          <ul className="legal-list">
            <li><strong>Razorpay:</strong> Payment processing gateway (requires billing details to verify payments).</li>
            <li><strong>Google:</strong> Used for secure authentication if you sign in using Google Sign-In.</li>
            <li><strong>Courier Partners:</strong> Shipped orders require sharing your name, phone number, and delivery address to complete dispatch.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">5. Cookies and Tracking</h2>
          <p className="legal-text">
            DesiSwad Foods uses cookies to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>
          <p className="legal-text">
            You can choose to disable cookies through your individual browser options.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-title">6. Consent</h2>
          <p className="legal-text">
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
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
