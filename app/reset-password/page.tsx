'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Failed to reset password');
      setSuccess(true);
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2C2C2C', margin: '0 0 8px' }}>🔒 Choose New Password</h2>
          <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 24px', lineHeight: 1.5 }}>
            Create a secure new password for your account. Make sure it's at least 6 characters long.
          </p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
              <h3 style={{ color: '#1E5B3A', fontWeight: 800, fontSize: '1.15rem', margin: '0 0 8px' }}>Password Updated!</h3>
              <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <Link href="/login" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg,#1E5B3A,#2d7a4f)', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                🔑 Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!token && (
                <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', color: '#b78103', fontSize: '0.82rem', marginBottom: 16 }}>
                  ⚠️ No password reset token was detected in the URL. Please verify your link.
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="auth-input"
                    style={{ width: '100%', padding: '13px 44px 13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#aaa' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat new password"
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
                {loading ? '⏳ Updating password...' : '🔒 Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
