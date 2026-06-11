'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setMessage(data.message || 'If the email is registered, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', background: 'linear-gradient(160deg, #f7f3e9 0%, #fffdf8 60%, #edf7f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .auth-card { animation: slideUp 0.4s ease both; width: 100%; maxWidth: 440px; }
        .auth-input:focus { border-color: #1E5B3A !important; box-shadow: 0 0 0 3px rgba(30,91,58,0.12); }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30,91,58,0.3); }
      `}</style>

      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E5B3A', margin: 0 }}>DesiSwad Foods</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>Pure Taste • Pure Trust</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.10)', border: '1px solid #eee', padding: 36 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C2C2C', margin: '0 0 8px' }}>🔑 Reset Password</h2>
          <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 24px', lineHeight: 1.5 }}>
            Enter the email address associated with your account, and we will email you a link to reset your password.
          </p>

          {message ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✉️</div>
              <h3 style={{ color: '#1E5B3A', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 8px' }}>Check Your Email</h3>
              <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>{message}</p>
              <Link href="/login" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg,#1E5B3A,#2d7a4f)', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="auth-input"
                  style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>

              {error && (
                <div style={{ background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: '0.875rem', marginBottom: 16, fontWeight: 600 }}>
                  ❌ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-btn"
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Sending reset link...' : '📨 Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link href="/login" style={{ fontSize: '0.85rem', color: '#888', fontWeight: 600, textDecoration: 'none' }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
