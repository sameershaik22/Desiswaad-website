'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, authHeaders } from '@/lib/authStore';

const REASONS = [
  { id: 'damaged',    label: '📦 Damaged Packaging',   desc: 'Box/pack was torn, crushed or broken on arrival' },
  { id: 'wrong_item', label: '❌ Wrong Item Received',  desc: 'I received a different product or flavour' },
  { id: 'quality',    label: '😕 Quality Issue',        desc: 'Stale, off-taste, or not as described' },
  { id: 'missing',    label: '🔍 Item Missing',         desc: 'Part of my order was not included' },
  { id: 'other',      label: '📝 Other',                desc: 'Something else (describe below)' },
];

import { Suspense } from 'react';

function ReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuthStore();

  const prefillOrderId = searchParams.get('orderId') || '';
  const [orderId, setOrderId] = useState(prefillOrderId);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleReason = (id: string) => {
    setSelectedReasons(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReasons.length === 0) { setError('Please select at least one reason'); return; }
    if (description.trim().length < 10) { setError('Please provide a description (at least 10 characters)'); return; }
    if (!isLoggedIn() && (!guestName || !guestEmail)) { setError('Please enter your name and email'); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders() as any) },
        body: JSON.stringify({
          order_id: orderId.trim().toUpperCase(),
          reason: selectedReasons.join(', '),
          description,
          image_url: imageUrl || null,
          customer_name: isLoggedIn() ? user?.name : guestName,
          customer_email: isLoggedIn() ? user?.email : guestEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f5e9, #fffdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#1E5B3A', fontWeight: 800, fontSize: '1.6rem', margin: '0 0 12px' }}>Request Submitted!</h2>
          <p style={{ color: '#666', margin: '0 0 8px' }}>
            We've received your issue report for order <strong style={{ fontFamily: 'monospace', color: '#B22222' }}>{orderId.toUpperCase()}</strong>.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 28px' }}>
            Our team will review it within <strong>24–48 hours</strong> and contact you on WhatsApp/email with a resolution.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/my-orders" style={{ padding: '13px 24px', background: '#1E5B3A', color: '#fff', borderRadius: 12, fontWeight: 800, textDecoration: 'none' }}>
              📦 My Orders
            </Link>
            <Link href="/shop" style={{ padding: '13px 24px', background: '#f5f5f5', color: '#555', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
              🛍️ Shop Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .reason-card { cursor:pointer; padding:16px; border:2px solid #e0e0e0; border-radius:12px; transition:all 0.2s; background:#fff; }
        .reason-card:hover { border-color:#1E5B3A; background:#f9fbf9; }
        .reason-card.selected { border-color:#1E5B3A; background:#e8f5e9; }
        .return-input:focus { border-color:#1E5B3A !important; box-shadow:0 0 0 3px rgba(30,91,58,0.1); }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #B22222 0%, #8B1A1A 100%)', padding: '36px 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Link href="/my-orders" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>← Back to My Orders</Link>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>🔁 Report Issue / Request Replacement</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem' }}>
            We take every issue seriously. Requests reviewed within 24–48 hours.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Policy Banner */}
        <div style={{ background: '#fff8e1', borderRadius: 12, padding: '14px 18px', border: '1px solid #ffe082', marginBottom: 24 }}>
          <p style={{ margin: 0, color: '#e65100', fontWeight: 700, fontSize: '0.875rem' }}>
            ⚠️ Reporting window: <strong>7 days from delivery</strong> · Food items eligible for replacement, not return · Image proof required for quality issues
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order ID */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#333', marginBottom: 8, fontSize: '0.9rem' }}>Order ID *</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} required placeholder="DS12345678"
              readOnly={!!prefillOrderId}
              className="return-input"
              style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '1rem', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', background: prefillOrderId ? '#f9f9f9' : '#fff' }} />
          </div>

          {/* Reason Checkboxes */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#333', marginBottom: 16, fontSize: '0.9rem' }}>What went wrong? * <span style={{ color: '#aaa', fontWeight: 400 }}>(select all that apply)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REASONS.map(r => (
                <div key={r.id} className={`reason-card ${selectedReasons.includes(r.id) ? 'selected' : ''}`}
                  onClick={() => toggleReason(r.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, border: `2px solid ${selectedReasons.includes(r.id) ? '#1E5B3A' : '#ccc'}`,
                    background: selectedReasons.includes(r.id) ? '#1E5B3A' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                    transition: 'all 0.2s',
                  }}>
                    {selectedReasons.includes(r.id) && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#222', fontSize: '0.9rem' }}>{r.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#888' }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#333', marginBottom: 8, fontSize: '0.9rem' }}>Describe the Issue *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4}
              placeholder="e.g. The Chekodi pack arrived completely crushed. Half the pieces were broken into powder. The box seal was already open."
              className="return-input"
              style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }} />
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#aaa' }}>{description.length} characters (minimum 10)</p>
          </div>

          {/* Image URL */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#333', marginBottom: 6, fontSize: '0.9rem' }}>
              📸 Photo / Video Proof <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.8rem' }}>(recommended)</span>
            </label>
            <p style={{ color: '#888', fontSize: '0.82rem', margin: '0 0 10px' }}>
              Share a photo link from Google Photos, WhatsApp, or Drive. This greatly speeds up resolution.
            </p>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://photos.google.com/... or https://drive.google.com/..."
              className="return-input"
              style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
          </div>

          {/* Guest fields if not logged in */}
          {!isLoggedIn() && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
              <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#333', fontSize: '0.9rem' }}>Your Contact Info *</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Name</label>
                  <input value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="Your name" className="return-input"
                    style={{ width: '100%', padding: '12px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
                  <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required type="email" placeholder="Your email" className="return-input"
                    style={{ width: '100%', padding: '12px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: '#fce4ec', borderRadius: 10, padding: '12px 16px', color: '#c62828', fontWeight: 600, marginBottom: 16, fontSize: '0.875rem' }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? '#ccc' : 'linear-gradient(135deg, #B22222, #8B1A1A)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {loading ? '⏳ Submitting...' : '🔁 Submit Issue Report'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#aaa' }}>
            By submitting, you agree our team may contact you for verification.
          </p>
        </form>
      </div>
    </>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>Loading form...</div>}>
      <ReturnPageContent />
    </Suspense>
  );
}
