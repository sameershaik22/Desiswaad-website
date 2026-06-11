'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to an API
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      {/* Hero */}
      <div className="contact-hero">
        <div className="container">
          <h1 className="heading-lg" style={{ color: '#fff', marginBottom: 8 }}>Get in Touch</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>We'd love to hear from you. Order, inquire or just say hello!</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Info Side */}
        <div className="contact-info">
          <div className="contact-info-card">
            <h2 className="heading-sm" style={{ marginBottom: 20, color: '#2C2C2C' }}>Contact Information</h2>

            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-item__icon">📞</div>
                <div>
                  <p className="contact-item__label">Phone</p>
                  <a href="tel:+919640497340" className="contact-item__val">+91 9640497340</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item__icon">📧</div>
                <div>
                  <p className="contact-item__label">Email</p>
                  <a href="mailto:desiswadfoods@evertrusttrading.com" className="contact-item__val">desiswadfoods@evertrusttrading.com</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item__icon">📍</div>
                <div>
                  <p className="contact-item__label">Location</p>
                  <p className="contact-item__val">Hyderabad, Telangana</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item__icon">🕐</div>
                <div>
                  <p className="contact-item__label">Business Hours</p>
                  <p className="contact-item__val">Monday – Saturday</p>
                  <p className="contact-item__sub">9:00 AM – 7:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="wa-cta-box">
              <p className="wa-cta-box__title">💬 Quickest Way to Order!</p>
              <p className="wa-cta-box__desc">Chat with us on WhatsApp for instant order assistance, custom orders, and bulk inquiries.</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I'd like to order from DesiSwad Foods.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: '#25D366', color: '#fff', width: '100%', justifyContent: 'center', gap: 8 }}
              >
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Google Maps Placeholder */}
          <div className="map-placeholder">
            <div className="map-placeholder__inner">
              <span>📍</span>
              <p>DesiSwad Foods</p>
              <p style={{ color: '#9E9E9E', fontSize: '0.85rem' }}>Hyderabad, Telangana</p>
              <a
                href="https://maps.google.com/?q=Hyderabad,Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12 }}
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="contact-form-side">
          <div className="contact-form-card">
            <h2 className="heading-sm" style={{ marginBottom: 4 }}>Send Us a Message</h2>
            <p style={{ color: '#9E9E9E', fontSize: '0.88rem', marginBottom: 24 }}>We typically reply within 24 hours.</p>

            {sent && (
              <div className="form-success">
                ✅ Thank you! Your message has been sent. We'll reply within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Your Name *</label>
                  <input id="contact-name" className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-phone">Phone Number</label>
                  <input id="contact-phone" className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" type="tel" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address *</label>
                <input id="contact-email" className="form-input" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" type="email" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">Subject *</label>
                <select id="contact-subject" className="form-input" name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">Select a topic</option>
                  <option value="order">New Order Inquiry</option>
                  <option value="track">Order Tracking Help</option>
                  <option value="bulk">Bulk / Wholesale Order</option>
                  <option value="gift">Gift Hamper Inquiry</option>
                  <option value="feedback">Feedback / Review</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  className="form-input"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }} id="contact-submit-btn">
                📨 Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="contact-faq">
            <h3 className="heading-sm" style={{ marginBottom: 16 }}>Frequently Asked Questions</h3>
            {[
              { q: 'How long does delivery take?', a: '3–7 business days across India. International delivery in 10–20 days.' },
              { q: 'Is Cash on Delivery available?', a: 'Yes! COD is available for all Indian orders with a small ₹30 handling charge.' },
              { q: 'Do you offer bulk/wholesale orders?', a: 'Absolutely! Contact us or WhatsApp for special bulk pricing.' },
              { q: 'Are your snacks preservative-free?', a: 'Yes! All our snacks are 100% natural with no artificial preservatives.' },
              { q: 'Can I return or get a refund?', a: 'If there is any quality issue, contact us within 48 hours of delivery. We\'ll make it right.' },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <p className="faq-q">❓ {faq.q}</p>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </>
  );
}
