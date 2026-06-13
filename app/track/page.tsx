'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  placed:     'Pending',
  confirmed:  'Confirmed',
  processing: 'Preparing',
  shipped:    'Out for Delivery',
  delivered:  'Delivered',
};
const STATUS_ICONS: Record<string, string> = {
  placed:     '📋',
  confirmed:  '✅',
  processing: '👨‍🍳',
  shipped:    '🚚',
  delivered:  '🎉',
};
const STATUS_COLORS: Record<string, string> = {
  placed:     '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#f97316',
  shipped:    '#10b981',
  delivered:  '#1E5B3A',
};

interface TrackingEvent { status: string; message: string; timestamp: string; }
interface OrderItem { id: string; name: string; weight: string; qty: number; price: number; }
interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  order_status: string;
  payment_mode: string;
  payment_status: string;
  subtotal?: number;
  shipping?: number;
  cod_charge?: number;
  total: number;
  created_at: string;
  items: OrderItem[];
  delivery_partner?: string;
  tracking_number?: string;
  expected_delivery_date?: string;
}

import { Suspense } from 'react';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchType, setSearchType] = useState<'id' | 'phone'>('id');
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [phoneOrders, setPhoneOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleTrackById = async (id?: string) => {
    const searchId = (id || orderId).trim().toUpperCase();
    if (!searchId) return;
    setLoading(true);
    setError('');
    setPhoneOrders([]);
    try {
      const res = await fetch(`/api/orders/${searchId}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data.order);
      setTracking(data.tracking);
    } catch {
      setError('Order not found. Please check your Order ID and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackByPhone = async () => {
    const phone = phoneNumber.replace(/\D/g, '');
    if (phone.length < 10) { setError('Please enter a valid 10-digit phone number.'); return; }
    setLoading(true);
    setError('');
    setOrder(null);
    setTracking([]);
    try {
      const res = await fetch(`/api/orders/phone/${phone}`);
      if (!res.ok) throw new Error('No orders found');
      const data = await res.json();
      setPhoneOrders(data.orders || []);
    } catch {
      setError('No orders found for this phone number. Please check and try again.');
      setPhoneOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'id') {
      handleTrackById();
    } else {
      handleTrackByPhone();
    }
  };

  const selectPhoneOrder = (o: Order) => {
    setOrder(o);
    setOrderId(o.id);
    setTracking((o as any).tracking || []);
    setPhoneOrders([]);
  };

  useEffect(() => {
    if (searchParams.get('id')) handleTrackById(searchParams.get('id') || '');
  }, []);

  const openReviewModal = (item: OrderItem) => {
    setReviewItem(item); setRating(5); setReviewText('');
    setReviewError(''); setReviewSuccess(false); setReviewModalOpen(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !reviewItem) return;
    setReviewLoading(true); setReviewError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id, product_slug: reviewItem.id, rating, review_text: reviewText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setReviewSuccess(true);
      setTimeout(() => setReviewModalOpen(false), 2000);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const currentStatusIdx = order ? STATUS_STEPS.indexOf(order.order_status) : -1;
  const whatsappNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340';

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', padding: '48px 20px', position: 'relative' }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute', top: 20, left: 20,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '50%', width: 42, height: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '1.2rem',
            transition: 'all 0.2s', backdropFilter: 'blur(4px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title="Go back"
        >
          &#8592;
        </button>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
          <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 800, margin: '0 0 8px' }}>Track Your Order</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '1rem' }}>
            Enter your Order ID or phone number for real-time delivery status
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Search Card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 28, border: '1px solid #e8e8e8' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            {(['id', 'phone'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setSearchType(type); setError(''); setOrder(null); setPhoneOrders([]); }}
                style={{
                  flex: 1, padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  background: searchType === type ? '#1E5B3A' : '#f8f8f8',
                  color: searchType === type ? '#fff' : '#666',
                  transition: 'all 0.2s',
                }}
              >
                {type === 'id' ? '🔢 Order ID' : '📱 Phone Number'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {searchType === 'id' ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  id="order-id-input"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="Enter Order ID (e.g. DS12345678)"
                  style={{ flex: 1, minWidth: 200, padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: '1rem', outline: 'none', transition: 'border 0.2s', fontFamily: 'monospace', letterSpacing: '1px' }}
                  onFocus={e => e.target.style.borderColor = '#1E5B3A'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
                <button type="submit" disabled={loading} id="track-order-btn"
                  style={{ padding: '14px 24px', background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                  {loading ? '🔍 Searching...' : '🔍 Track Order'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="Enter your 10-digit phone number"
                  maxLength={15}
                  style={{ flex: 1, minWidth: 200, padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1E5B3A'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
                <button type="submit" disabled={loading}
                  style={{ padding: '14px 24px', background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                  {loading ? '🔍 Searching...' : '📱 Find Orders'}
                </button>
              </div>
            )}
          </form>

          {error && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fce4ec', borderRadius: 8, color: '#c62828', fontWeight: 600, fontSize: '0.9rem' }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Phone Search Results — Multiple Orders */}
        {phoneOrders.length > 0 && !order && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24, border: '1px solid #e8e8e8' }}>
            <h3 style={{ margin: '0 0 16px', color: '#1E5B3A', fontWeight: 700 }}>📋 {phoneOrders.length} Order{phoneOrders.length > 1 ? 's' : ''} Found</h3>
            {phoneOrders.map(o => {
              const sc = { placed: '#f59e0b', confirmed: '#3b82f6', processing: '#f97316', shipped: '#10b981', delivered: '#1E5B3A', cancelled: '#ef4444' }[o.order_status] || '#888';
              return (
                <div key={o.id} onClick={() => selectPhoneOrder(o)}
                  style={{ padding: '16px', borderRadius: 10, border: '1px solid #eee', marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E5B3A'; e.currentTarget.style.background = '#f9fbf9'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#B22222', fontFamily: 'monospace' }}>{o.id}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {o.items?.length || 0} item{(o.items?.length || 0) > 1 ? 's' : ''} • ₹{o.total}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, background: sc, color: '#fff', fontWeight: 700, fontSize: '0.78rem' }}>
                      {STATUS_LABELS[o.order_status] || o.order_status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Click to view →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details */}
        {order && (
          <>
            {/* Status Banner */}
            {(order.order_status === 'shipped' || order.order_status === 'delivered') && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, border: `2px solid ${STATUS_COLORS[order.order_status]}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: STATUS_COLORS[order.order_status] }} />
                <div style={{ paddingLeft: 8 }}>
                  <h2 style={{ fontSize: '1.4rem', color: '#111', marginBottom: 4, fontWeight: 800 }}>
                    {order.order_status === 'delivered' ? '🎉 Delivered!' : `🚚 Out for Delivery — Arriving ${order.expected_delivery_date || 'soon'}`}
                  </h2>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>
                    {order.delivery_partner && <span>Shipped with <strong>{order.delivery_partner}</strong></span>}
                    {order.tracking_number && <span style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #ddd' }}>Tracking ID: <strong>{order.tracking_number}</strong></span>}
                  </p>
                </div>
              </div>
            )}

            {/* Order Info Grid */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Order ID', value: order.id, mono: true, color: '#B22222' },
                  { label: 'Customer', value: order.customer_name },
                  { label: 'Order Total', value: `₹${order.total}`, color: '#1E5B3A', bold: true },
                  { label: 'Payment', value: `${order.payment_mode} (${order.payment_status === 'paid' ? '✔ Paid' : 'Pending'})` },
                  { label: 'Ordered On', value: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Deliver To', value: `${order.city}, ${order.state}` },
                ].map(({ label, value, mono, color, bold }) => (
                  <div key={label}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ margin: 0, fontWeight: bold ? 800 : 600, color: color || '#222', fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.95rem' : '0.9rem' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Full Delivery Address</p>
                <p style={{ margin: 0, color: '#444', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {order.address}, {order.city}, {order.state} {order.pincode}, {order.country}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {/* Progress Bar */}
            {order.order_status !== 'cancelled' && order.order_status !== 'Cancelled' ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
                <h3 style={{ margin: '0 0 28px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Progress</h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                  {STATUS_STEPS.map((status, idx) => {
                    const isDone = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    const color = isDone ? STATUS_COLORS[status] : '#e0e0e0';
                    return (
                      <div key={status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Connector line */}
                        {idx < STATUS_STEPS.length - 1 && (
                          <div style={{ position: 'absolute', top: 20, left: '50%', width: '100%', height: 3, background: idx < currentStatusIdx ? STATUS_COLORS[STATUS_STEPS[idx + 1]] : '#e0e0e0', zIndex: 0, transition: 'background 0.5s' }} />
                        )}
                        {/* Circle */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: isDone ? color : '#f5f5f5',
                          border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.1rem', zIndex: 1, transition: 'all 0.4s',
                          boxShadow: isCurrent ? `0 0 0 6px ${color}22` : 'none',
                        }}>
                          {isDone ? (isCurrent ? STATUS_ICONS[status] : '✓') : <span style={{ color: '#bbb', fontSize: '0.85rem' }}>{idx + 1}</span>}
                        </div>
                        <p style={{ marginTop: 10, fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 600, color: isDone ? color : '#bbb', textAlign: 'center', lineHeight: 1.3 }}>
                          {STATUS_LABELS[status]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ background: '#fce4ec', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #ffcdd2', textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#c62828', fontSize: '1.2rem' }}>🚫 Order Cancelled</h3>
                <p style={{ margin: '8px 0 0', color: '#d32f2f', fontSize: '0.9rem' }}>This order has been cancelled. If this was a mistake, please contact our support team on WhatsApp.</p>
              </div>
            )}

            {/* Timeline */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
              <h3 style={{ margin: '0 0 20px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Event Timeline</h3>
              {tracking.map((event, i) => {
                const isLatest = i === tracking.length - 1;
                const eventColor = STATUS_COLORS[event.status] || '#888';
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: isLatest ? 0 : 20, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: isLatest ? eventColor : '#D4AF37', border: isLatest ? `2px solid ${eventColor}` : '2px solid #D4AF37', flexShrink: 0 }} />
                      {!isLatest && <div style={{ width: 2, flex: 1, background: '#e8e8e8', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingTop: 0, paddingBottom: 4 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#222', fontSize: '0.9rem' }}>
                        {STATUS_ICONS[event.status]} {STATUS_LABELS[event.status] || event.status}
                      </p>
                      <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: '#666' }}>{event.message}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>
                        {new Date(event.timestamp || (event as any).created_at || '').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items Ordered */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
              <h3 style={{ margin: '0 0 16px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🛒 Items Ordered</h3>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < (order.items?.length || 0) - 1 ? '1px solid #f5f5f5' : 'none', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#222' }}>{item.name} <span style={{ fontWeight: 400, color: '#888' }}>— {item.weight}</span></p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Qty: {item.qty}</p>
                    {order.order_status === 'delivered' && (
                      <button onClick={() => openReviewModal(item)}
                        style={{ marginTop: 8, padding: '5px 12px', border: '1px solid #D4AF37', borderRadius: 6, background: '#fffbed', color: '#b8860b', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                        ⭐ Write a Review
                      </button>
                    )}
                  </div>
                  <span style={{ fontWeight: 800, color: '#B22222', fontSize: '1rem' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              {/* Price Summary */}
              {(order.subtotal !== undefined) && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #f0f0f0' }}>
                  {[
                    { label: 'Subtotal', value: `₹${order.subtotal}` },
                    { label: 'Shipping', value: `₹${order.shipping}` },
                    ...(order.cod_charge ? [{ label: 'COD Charge', value: `₹${order.cod_charge}` }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.875rem', color: '#666' }}>
                      <span>{label}</span><span>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1E5B3A', fontSize: '1.1rem', paddingTop: 8, borderTop: '1px solid #eee', marginTop: 4 }}>
                    <span>Order Total</span><span>₹{order.total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)', borderRadius: 16, padding: 24, border: '1px solid #c8e6c9', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#1E5B3A', fontSize: '1rem' }}>Need help with your order? 👋</p>
              <p style={{ margin: '0 0 16px', color: '#555', fontSize: '0.9rem' }}>Our team is available 9am – 7pm daily</p>
              <a
                href={`https://wa.me/${whatsappNum}?text=Hi! I need help with Order ID: ${order.id}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '12px 28px', background: '#25D366', color: '#fff', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
              >
                💬 WhatsApp Support
              </a>
            </div>
          </>
        )}

        {/* Empty State */}
        {!order && phoneOrders.length === 0 && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px dashed #e0e0e0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📦</div>
            <h3 style={{ color: '#333', fontWeight: 700, marginBottom: 8 }}>Track your DesiSwad order</h3>
            <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Your Order ID (e.g. <strong style={{ fontFamily: 'monospace' }}>DS12345678</strong>) was sent to your email and WhatsApp when you placed the order.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && reviewItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, margin: 20, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setReviewModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#555', width: 32, height: 32, borderRadius: '50%' }}>×</button>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 6, fontWeight: 800, color: '#1E5B3A' }}>⭐ Rate Your Product</h2>
            <p style={{ color: '#666', marginBottom: 20, fontSize: '0.9rem' }}><strong>{reviewItem.name}</strong> ({reviewItem.weight})</p>

            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h3 style={{ color: '#1E5B3A', marginBottom: 8 }}>Review Submitted!</h3>
                <p style={{ color: '#666' }}>Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.875rem' }}>Overall Rating *</label>
                  <div style={{ display: 'flex', gap: 8, fontSize: '2.5rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => setRating(star)} style={{ color: star <= rating ? '#f59e0b' : '#e0e0e0', transition: 'color 0.15s', lineHeight: 1 }}>★</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.875rem' }}>Your Review *</label>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required placeholder="What did you like? Taste, freshness, packaging?" rows={4}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 8, resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                {reviewError && <p style={{ color: '#c62828', fontSize: '0.875rem', marginBottom: 12 }}>{reviewError}</p>}
                <button type="submit" disabled={reviewLoading}
                  style={{ width: '100%', padding: '14px', background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: reviewLoading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
                  {reviewLoading ? 'Submitting...' : '⭐ Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>Loading tracking...</div>}>
      <TrackPageContent />
    </Suspense>
  );
}
