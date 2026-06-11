'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: '#fff8e1', color: '#f57c00' },
  Approved: { bg: '#e8f5e9', color: '#2e7d32' },
  Rejected: { bg: '#fce4ec', color: '#c62828' },
  Replaced: { bg: '#e3f2fd', color: '#1565c0' },
  Refunded: { bg: '#f3e5f5', color: '#6a1b9a' },
};

interface ReturnItem {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  reason: string;
  description: string;
  image_url?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  total?: number;
  order_status?: string;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/check-auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          window.location.href = '/admin';
        } else {
          fetch('/api/admin/returns')
            .then(r => r.json())
            .then(d => {
              if (d.error) {
                window.location.href = '/admin';
              } else {
                setReturns(d.returns || []);
              }
            })
            .catch(() => { window.location.href = '/admin'; })
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        window.location.href = '/admin';
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    } catch {
      alert('Logout failed');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/returns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: noteInputs[id] || null }),
    });
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status, admin_note: noteInputs[id] || r.admin_note } : r));
  };

  const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Replaced', 'Refunded'];
  const filtered = filter === 'All' ? returns : returns.filter(r => r.status === filter);



  const pendingCount = returns.filter(r => r.status === 'Pending').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #B22222, #8B1A1A)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem' }}>🔁 Returns & Issues</span>
          {pendingCount > 0 && (
            <span style={{ background: '#fff', color: '#B22222', borderRadius: 20, padding: '2px 10px', fontWeight: 800, fontSize: '0.78rem' }}>
              {pendingCount} Pending
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6 }}>
            ← Orders Dashboard
          </Link>
          <button onClick={() => window.location.reload()} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>
            🔄 Refresh
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
          {STATUSES.slice(1).map(s => {
            const count = returns.filter(r => r.status === s).length;
            const sc = STATUS_COLORS[s] || { bg: '#f5f5f5', color: '#888' };
            return (
              <div key={s} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: `2px solid ${count > 0 ? sc.color : '#eee'}`, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: '#aaa', fontWeight: 700, textTransform: 'uppercase' }}>{s}</p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: sc.color }}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                background: filter === s ? '#B22222' : '#fff', color: filter === s ? '#fff' : '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {s} {s !== 'All' ? `(${returns.filter(r => r.status === s).length})` : `(${returns.length})`}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>⏳ Loading return requests...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px dashed #ddd' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <p style={{ color: '#888', fontWeight: 600 }}>No {filter !== 'All' ? filter.toLowerCase() : ''} return requests found</p>
          </div>
        )}

        {filtered.map((ret) => {
          const sc = STATUS_COLORS[ret.status] || STATUS_COLORS['Pending'];
          const isOpen = expanded === ret.id;
          return (
            <div key={ret.id} style={{ background: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              {/* Row header */}
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer', borderBottom: isOpen ? '1px solid #f0f0f0' : 'none' }}
                onClick={() => setExpanded(isOpen ? null : ret.id)}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#B22222', fontSize: '0.95rem' }}>{ret.order_id}</span>
                    <span style={{ padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${sc.color}33` }}>{ret.status}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#888' }}>{ret.customer_name} · {ret.customer_email}</p>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#666', flex: 1, minWidth: 160 }}>
                  <strong>Reason:</strong> {ret.reason}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {ret.total && <span style={{ fontWeight: 700, color: '#1E5B3A' }}>₹{ret.total}</span>}
                  <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                    {new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '20px 20px' }}>
                  {/* Description */}
                  <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid #f0f0f0' }}>
                    <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase' }}>Customer Description</p>
                    <p style={{ margin: 0, color: '#333', fontSize: '0.9rem', lineHeight: 1.6 }}>{ret.description || '—'}</p>
                  </div>

                  {/* Proof image link */}
                  {ret.image_url && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase' }}>Proof Link</p>
                      <a href={ret.image_url} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#1E5B3A', fontWeight: 700, fontSize: '0.875rem', wordBreak: 'break-all' }}>
                        📸 {ret.image_url}
                      </a>
                    </div>
                  )}

                  {/* Admin note */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>Admin Note (optional)</label>
                    <input
                      value={noteInputs[ret.id] ?? (ret.admin_note || '')}
                      onChange={e => setNoteInputs(prev => ({ ...prev, [ret.id]: e.target.value }))}
                      placeholder="e.g. Approved. Replacement dispatched via Blue Dart on 14 Apr"
                      style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Approved', 'Rejected', 'Replaced', 'Refunded', 'Pending'].map(s => (
                      <button key={s} onClick={() => updateStatus(ret.id, s)}
                        style={{ padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s',
                          background: ret.status === s ? (STATUS_COLORS[s]?.color || '#888') : '#f0f0f0',
                          color: ret.status === s ? '#fff' : '#555' }}>
                        {s === 'Approved' ? '✅' : s === 'Rejected' ? '❌' : s === 'Replaced' ? '🔄' : s === 'Refunded' ? '💰' : '⏳'} {s}
                      </button>
                    ))}
                  </div>

                  {/* Order link */}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10 }}>
                    <Link href={`/track?id=${ret.order_id}`} target="_blank"
                      style={{ fontSize: '0.8rem', color: '#1E5B3A', fontWeight: 700, textDecoration: 'none' }}>
                      📦 View Order Tracking →
                    </Link>
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi ${ret.customer_name}! Regarding your issue with Order ${ret.order_id}: `}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: '#25D366', fontWeight: 700, textDecoration: 'none' }}>
                      💬 WhatsApp Customer →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
