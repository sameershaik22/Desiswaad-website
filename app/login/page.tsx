'use client';
import { useState, Suspense, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';

// Extend window to hold Google GSI callback
declare global {
  interface Window {
    handleGoogleCredential: (response: { credential: string }) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn()) {
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/shop');
    }
  }, [isLoggedIn, router, searchParams]);

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tab === 'signup' && form.password !== form.confirm) {
      setError('Passwords do not match'); return;
    }
    if (tab === 'signup' && form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Something went wrong');
      login(data.token, data.user);
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/my-orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || 'Google sign-in failed');
      login(data.token, data.user);
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/shop');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, router, searchParams]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return; // gracefully skip if not configured

    // Expose callback for GSI
    window.handleGoogleCredential = (response: { credential: string }) => {
      handleGoogleSuccess(response.credential);
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleSuccess]);

  const triggerGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Sign-In is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local');
      return;
    }
    window.google?.accounts.id.prompt();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f7f3e9 0%, #fffdf8 60%, #edf7f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .auth-card { animation: slideUp 0.4s ease both; }
        .auth-input:focus { border-color: #1E5B3A !important; box-shadow: 0 0 0 3px rgba(30,91,58,0.12); }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30,91,58,0.3); }
        .google-btn:hover { border-color: #1E5B3A !important; background: #f9fffe !important; }
        .tab-active { background: #1E5B3A !important; color: #fff !important; }
      `}</style>

      <div className="auth-card" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E5B3A', margin: 0 }}>DesiSwad Foods</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 0' }}>Pure Taste • Pure Trust</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.10)', overflow: 'hidden', border: '1px solid #eee' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={t === tab ? 'tab-active' : ''}
                style={{ flex: 1, padding: '16px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', background: '#f8f8f8', color: '#888', transition: 'all 0.2s' }}>
                {t === 'login' ? '🔑 Login' : '✨ Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '28px 28px 24px' }}>
            {tab === 'signup' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="auth-input"
                    style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="Phone Number" className="auth-input"
                    style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} />
                </div>
              </>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address *</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" required placeholder="you@example.com" className="auth-input"
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: tab === 'signup' ? 16 : 8 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input name="password" value={form.password} onChange={handleChange} type={showPass ? 'text' : 'password'} required placeholder="Minimum 6 characters" className="auth-input"
                  style={{ width: '100%', padding: '13px 44px 13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#aaa' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {tab === 'signup' && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password *</label>
                <input name="confirm" value={form.confirm} onChange={handleChange} type={showPass ? 'text' : 'password'} required placeholder="Repeat password" className="auth-input"
                  style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.95rem', boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} />
              </div>
            )}

            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <Link href="/forgot-password" style={{ fontSize: '0.82rem', color: '#1E5B3A', fontWeight: 600 }}>Forgot password?</Link>
              </div>
            )}

            {error && (
              <div style={{ background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: 8, padding: '10px 14px', color: '#c62828', fontSize: '0.875rem', marginBottom: 16, fontWeight: 600 }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-btn"
              style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Please wait...' : tab === 'login' ? '🔑 Login to My Account' : '✨ Create Account'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
              <span style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={triggerGoogleSignIn}
              disabled={googleLoading}
              className="google-btn"
              style={{
                width: '100%', padding: '14px',
                background: googleLoading ? '#f5f5f5' : '#fff',
                color: '#333', border: '1.5px solid #e0e0e0',
                borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, transition: 'all 0.2s',
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              {googleLoading ? (
                <>
                  <span style={{ fontSize: '1rem' }}>⏳</span>
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#888', fontSize: '0.85rem' }}>
          <Link href="/shop" style={{ color: '#1E5B3A', fontWeight: 600 }}>← Continue Shopping</Link>
          {' '}without account
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
