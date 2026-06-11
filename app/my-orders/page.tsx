'use client';
import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore, authHeaders } from '@/lib/authStore';
import { useCartStore } from '@/lib/store';
import { PRODUCTS } from '@/lib/products';

// Status styling for badge and tracking steps
const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  placed:     { label: 'Order Placed',     color: '#b8860b', bg: '#fffbea', icon: '📋', desc: 'We have received your order and are verifying details.' },
  confirmed:  { label: 'Confirmed',        color: '#1565c0', bg: '#e3f2fd', icon: '✅', desc: 'Your order has been confirmed by our kitchen.' },
  processing: { label: 'Preparing',        color: '#e65100', bg: '#fff3e0', icon: '👨‍🍳', desc: 'Our chefs are preparing your fresh, tasty snacks.' },
  shipped:    { label: 'Out for Delivery', color: '#2e7d32', bg: '#e8f5e9', icon: '🚚', desc: 'Your snack pack is out for delivery with our rider.' },
  delivered:  { label: 'Delivered',        color: '#1E5B3A', bg: '#c8e6c9', icon: '🎉', desc: 'Delivered! Fresh snacking awaits you.' },
  cancelled:  { label: 'Cancelled',        color: '#c62828', bg: '#fce4ec', icon: '❌', desc: 'This order was cancelled.' },
};

const STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const normalizeStatus = (status: string): string => {
  if (!status) return 'placed';
  const s = status.toLowerCase().trim();
  if (s === 'pending' || s === 'placed' || s === 'order placed' || s === 'order_placed') return 'placed';
  if (s === 'confirmed' || s === 'order confirmed' || s === 'order_confirmed') return 'confirmed';
  if (s === 'preparing' || s === 'processing' || s === 'cooked' || s === 'cooking') return 'processing';
  if (s === 'out for delivery' || s === 'out_for_delivery' || s === 'shipped' || s === 'shipping') return 'shipped';
  if (s === 'delivered' || s === 'completed' || s === 'complete') return 'delivered';
  if (s === 'cancelled' || s === 'cancelled' || s === 'canceled') return 'cancelled';
  return 'placed'; // fallback
};

interface TimelineProps {
  orderStatus: string;
  expectedDeliveryDate?: string;
  trackingEvents?: TrackEvent[];
}

function OrderTimeline({ orderStatus, expectedDeliveryDate, trackingEvents }: TimelineProps) {
  const normStatus = normalizeStatus(orderStatus);
  const currentStep = STEPS.indexOf(normStatus);
  const isCancelled = normStatus === 'cancelled';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Start animation on mount to create liquid flow effect
    const t = setTimeout(() => {
      setMounted(true);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#fff', border: '1px solid var(--cream-dark)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
      <h4 style={{ margin: '0 0 20px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f6f6f6', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🚀</span> Order Delivery Status Journey
      </h4>

      {/* Desktop Timeline Display */}
      <div className="timeline-desktop" style={{ position: 'relative', padding: '24px 0 60px', margin: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          {STEPS.map((step, si) => {
            const done = si <= currentStep && normStatus !== 'cancelled';
            const cur = si === currentStep && normStatus !== 'cancelled';
            const stepMeta = STATUS_META[step] || { label: step, icon: '📍', desc: '' };

            let circleBg = '#f9fafb';
            let circleBorder = '2.5px solid #e5e7eb';
            let circleColor = '#9ca3af';

            if (done) {
              circleBg = 'var(--green)';
              circleBorder = '2.5px solid var(--green)';
              circleColor = '#fff';
            }
            if (cur) {
              circleBg = 'var(--green)';
              circleBorder = '2.5px solid var(--green)';
              circleColor = '#fff';
            }
            if (isCancelled && step === 'placed') {
              circleBg = 'var(--red)';
              circleBorder = '2.5px solid var(--red)';
              circleColor = '#fff';
            }

            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: circleBg, border: circleBorder, color: circleColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.95rem', fontWeight: 'bold',
                    boxShadow: cur ? 'var(--shadow-gold)' : 'none',
                    transition: 'all 0.5s ease',
                    transform: cur ? 'scale(1.15)' : 'scale(1)',
                    position: 'relative', zIndex: 3
                  }}>
                    {done ? (cur ? stepMeta.icon : '✓') : (isCancelled && step === 'placed' ? '×' : si + 1)}
                  </div>
                  <div style={{ position: 'absolute', top: '48px', width: '130px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: cur ? 800 : 600, color: done ? 'var(--green-dark)' : 'var(--gray-500)', lineHeight: 1.25 }}>
                      {stepMeta.label}
                    </span>
                    {cur && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--green-dark)', fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Current Status
                      </span>
                    )}
                  </div>
                </div>
                {si < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '6px', background: '#e5e7eb', margin: '0 8px', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: !mounted || isCancelled ? '0%' : (si < currentStep ? '100%' : (si === currentStep ? '50%' : '0%')),
                      background: 'linear-gradient(90deg, var(--green-light), var(--green))',
                      transition: `width 1s cubic-bezier(0.25, 1, 0.5, 1) ${si * 0.2}s`
                    }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Timeline Display */}
      <div className="timeline-mobile">
        {STEPS.map((step, si) => {
          const done = si <= currentStep && normStatus !== 'cancelled';
          const cur = si === currentStep && normStatus !== 'cancelled';
          const stepMeta = STATUS_META[step] || { label: step, icon: '📍', desc: '' };

          let circleBg = '#f9fafb';
          let circleBorder = '2.5px solid #e5e7eb';
          let circleColor = '#9ca3af';

          if (done) {
            circleBg = 'var(--green)';
            circleBorder = '2.5px solid var(--green)';
            circleColor = '#fff';
          }
          if (cur) {
            circleBg = 'var(--green)';
            circleBorder = '2.5px solid var(--green)';
            circleColor = '#fff';
          }
          if (isCancelled && step === 'placed') {
            circleBg = 'var(--red)';
            circleBorder = '2.5px solid var(--red)';
            circleColor = '#fff';
          }

          return (
            <div key={step} style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: circleBg, border: circleBorder, color: circleColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 'bold', zIndex: 2,
                  transform: cur ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  {done ? (cur ? stepMeta.icon : '✓') : (isCancelled && step === 'placed' ? '×' : si + 1)}
                </div>
                {si < STEPS.length - 1 && (
                  <div style={{ width: '3px', flex: 1, background: (si < currentStep && !isCancelled) ? 'var(--green)' : '#e0e0e0', minHeight: '32px' }} />
                )}
              </div>
              <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontSize: '0.9rem', color: done ? 'var(--green-dark)' : 'var(--gray-800)' }}>
                  {stepMeta.label} {cur && ' (Current Step)'}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.3 }}>
                  {stepMeta.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div style={{ background: '#fce4ec', color: 'var(--red)', borderRadius: '8px', padding: '14px', marginTop: 20, fontSize: '0.85rem', fontWeight: 700, border: '1px solid var(--red-light)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <span>🚫</span> Cancellation confirmed. If this was an accident, contact our team to rebook.
        </div>
      )}
    </div>
  );
}

interface OrderItem { id?: string; name: string; weight: string; qty: number; price: number; product_id?: number; }
interface TrackEvent { status: string; message: string; timestamp: string; }
interface ReturnReq { id: string; status: string; reason: string; created_at: string; }
interface Order {
  id: string; customer_name: string; email: string; phone: string;
  address: string; city: string; state: string; pincode: string;
  order_status: string; payment_mode: string; payment_status: string;
  total: number; subtotal: number; shipping: number; cod_charge: number;
  created_at: string; delivered_at: string | null; items: OrderItem[];
  delivery_partner?: string; tracking_number?: string; expected_delivery_date?: string;
}

interface Review { id: number; product_slug: string; rating: number; }

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<Record<string, { tracking: TrackEvent[]; returnRequest: ReturnReq | null; reviews: Review[] }>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Update current time every minute for countdown timers
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ item: OrderItem; orderId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/my-orders');
      return;
    }
    fetch('/api/my-orders', { headers: authHeaders() as any })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error);
        } else {
          setOrders(d.orders || []);
        }
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!trackData[orderId]) {
      try {
        const res = await fetch(`/api/my-orders/${orderId}`, { headers: authHeaders() as any });
        const data = await res.json();
        if (data.order) {
          setTrackData(prev => ({
            ...prev,
            [orderId]: {
              tracking: data.tracking || [],
              returnRequest: data.returnRequest || null,
              reviews: data.reviews || []
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    }
  };

  const getProductImage = (item: OrderItem) => {
    const prod = PRODUCTS.find(p => p.id === item.product_id || p.id === Number(item.id));
    if (prod) return prod.image;
    const nameProd = PRODUCTS.find(p => p.name.toLowerCase() === item.name.toLowerCase());
    if (nameProd) return nameProd.image;
    return '/product_chekodi_front.jpeg'; // default fallback image
  };

  // Check if eligible for return status text details
  const getReturnStatusInfo = (order: Order) => {
    if (normalizeStatus(order.order_status) !== 'delivered') return null;
    
    // Use delivered_at from DB, or fallback to current time if just marked delivered
    const deliveryTime = order.delivered_at ? new Date(order.delivered_at).getTime() : Date.now();
    const diffMs = currentTime - deliveryTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    const msRemaining = (24 * 60 * 60 * 1000) - diffMs;
    
    if (diffHours <= 24 && msRemaining > 0) {
      const remainingHours = Math.floor(msRemaining / (1000 * 60 * 60));
      const remainingMins = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      let warnLevel = 'normal';
      if (diffHours >= 23) warnLevel = 'critical'; // < 1 hour
      else if (diffHours >= 18) warnLevel = 'warning'; // < 6 hours
      
      return { 
        eligible: true, 
        hours: remainingHours,
        mins: remainingMins,
        text: `${remainingHours}h ${remainingMins}m remaining`,
        warnLevel 
      };
    }
    
    return { eligible: false, text: 'Return window expired' };
  };

  // Check if eligible for cancel (if order is not yet shipped or delivered)
  const canCancel = (order: Order) => {
    return ['placed', 'confirmed', 'processing'].includes(normalizeStatus(order.order_status));
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      const prod = PRODUCTS.find(p => p.id === item.product_id || p.id === Number(item.id))
        || PRODUCTS.find(p => p.name.toLowerCase() === item.name.toLowerCase());
      
      addItem({
        id: item.product_id || Number(item.id) || 1,
        name: item.name,
        price: item.price,
        image: prod ? prod.image : '/product_chekodi_front.jpeg',
        category: prod ? prod.category : 'Namkeen',
        weight: item.weight,
      });
    });
    openCart();
  };

  const openReviewModal = (item: OrderItem, orderId: string) => {
    setReviewItem({ item, orderId });
    setRating(5);
    setReviewText('');
    setReviewError('');
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const slug = reviewItem.item.id || reviewItem.item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: reviewItem.orderId,
          product_slug: slug,
          rating,
          review_text: reviewText
        }),
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

  // Prints the order card formatted as an invoice
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.weight})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.qty}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #2C2C2C; padding: 40px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1E5B3A; padding-bottom: 20px; }
            .details { margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #1E5B3A; color: #fff; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; }
            .totals { float: right; margin-top: 24px; text-align: right; width: 300px; border-top: 1.5px solid #eee; padding-top: 12px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.95rem; }
            .brand-name { color: #1E5B3A; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <h1 class="brand-name">DesiSwaad</h1>
                <p style="margin: 4px 0 0; color: #616161; font-size: 0.9rem;">Authentic Homemade Telugu Snacks</p>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; color: #B22222; font-size: 1.5rem;">TAX INVOICE</h2>
                <p style="margin: 4px 0 0;"><strong>Order ID:</strong> ${order.id}</p>
                <p style="margin: 4px 0 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div class="details">
              <div>
                <h3 style="color: #1E5B3A; margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; border-bottom: 1.5px solid #eee; padding-bottom: 4px;">Delivery Address</h3>
                <p style="margin: 0; font-weight: bold;">${order.customer_name}</p>
                <p style="margin: 4px 0 0;">📞 ${order.phone}</p>
                <p style="margin: 4px 0 0;">${order.address}</p>
                <p style="margin: 4px 0 0;">${order.city}, ${order.state} - ${order.pincode}</p>
              </div>
              <div>
                <h3 style="color: #1E5B3A; margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; border-bottom: 1.5px solid #eee; padding-bottom: 4px;">Payment Summary</h3>
                <p style="margin: 0;"><strong>Payment Method:</strong> ${order.payment_mode}</p>
                <p style="margin: 4px 0 0;"><strong>Payment Status:</strong> ${order.payment_status === 'paid' ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div><span>Subtotal:</span><span>₹${order.subtotal || (order.total - (order.shipping || 0) - (order.cod_charge || 0))}</span></div>
              <div><span>Shipping Fee:</span><span>₹${order.shipping || 0}</span></div>
              ${order.cod_charge ? `<div><span>COD Convenience Charge:</span><span>₹${order.cod_charge}</span></div>` : ''}
              <div style="font-size: 1.15rem; font-weight: bold; color: #1E5B3A; border-top: 2px solid #1E5B3A; padding-top: 8px; margin-top: 8px;">
                <span>Total Paid:</span><span>₹${order.total}</span>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <style>{`
        @keyframes ds-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ds-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fadeup {
          animation: ds-fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .shimmer-skeleton {
          background: linear-gradient(90deg, #f3f3f3 25%, #e6e6e6 50%, #f3f3f3 75%);
          background-size: 200% 100%;
          animation: ds-shimmer 1.5s infinite ease-in-out;
        }
        .orders-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-top: 32px;
        }
        @media (min-width: 992px) {
          .orders-layout-grid {
            grid-template-columns: 1fr 340px;
          }
        }
        .order-card-wrapper {
          border: 1px solid var(--cream-dark);
          border-radius: var(--radius-md);
          background: var(--white);
          margin-bottom: 28px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-bounce);
        }
        .order-card-wrapper:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--gold-light);
        }
        .btn-action-primary {
          background: linear-gradient(135deg, var(--green), var(--green-light));
          color: var(--white);
          border: none;
          padding: 12px 20px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(30, 91, 58, 0.25);
        }
        .btn-action-secondary {
          background: var(--white);
          color: var(--gray-800);
          border: 1.5px solid var(--gray-200);
          padding: 12px 20px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action-secondary:hover {
          border-color: var(--green);
          color: var(--green);
          background: var(--cream-light);
        }
        .btn-action-danger {
          background: var(--white);
          color: var(--red);
          border: 1.5px solid var(--red-light);
          padding: 12px 20px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action-danger:hover {
          background: #fce4ec;
          box-shadow: 0 4px 12px rgba(178, 34, 34, 0.15);
        }
        .timeline-desktop {
          display: flex;
          position: relative;
          justify-content: space-between;
          padding: 24px 0 12px;
          margin: 0 12px;
        }
        .timeline-mobile {
          display: none;
          flex-direction: column;
          gap: 20px;
          padding: 16px 8px;
        }
        .sidebar-panel {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .sidebar-card {
          background: var(--white);
          border: 1px solid var(--cream-dark);
          border-radius: var(--radius-md);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        @media (max-width: 768px) {
          .timeline-desktop {
            display: none !important;
          }
          .timeline-mobile {
            display: flex !important;
          }
        }
      `}</style>

      {/* Hero Banner Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)', padding: '54px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -55, left: -55, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '3.2rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }}>📦</span>
          <h1 style={{ color: 'var(--gold)', fontSize: '2.8rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>My Orders</h1>
          {user ? (
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.98rem' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user.name}</strong> • Account: {user.email}
            </p>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.98rem' }}>Track, download tax invoices, reorder items or manage returns.</p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '40px 24px 100px' }}>
        {isLoggedIn() && (
          <div className="orders-layout-grid">
            
            {/* Left Main orders Column */}
            <div>
              {error && (
                <div style={{ background: '#fce4ec', borderRadius: 'var(--radius-md)', padding: '16px 20px', color: 'var(--red)', marginBottom: 24, fontWeight: 700, border: '1px solid var(--red-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>❌</span> {error}
                </div>
              )}

              {/* SKELETON LOADING STATE */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[1, 2].map((n) => (
                    <div key={n} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: 16, width: '60%' }}>
                          <div className="shimmer-skeleton" style={{ width: '40%', height: '20px', borderRadius: '4px' }} />
                          <div className="shimmer-skeleton" style={{ width: '30%', height: '20px', borderRadius: '4px' }} />
                        </div>
                        <div className="shimmer-skeleton" style={{ width: '20%', height: '20px', borderRadius: '4px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div className="shimmer-skeleton" style={{ width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div className="shimmer-skeleton" style={{ width: '50%', height: '16px', borderRadius: '4px' }} />
                          <div className="shimmer-skeleton" style={{ width: '25%', height: '14px', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EMPTY STATE */}
              {!loading && orders.length === 0 && !error && (
                <div className="animate-fadeup" style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--cream-dark)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '5.5rem', marginBottom: 24 }}>🛍️</div>
                  <h2 style={{ color: 'var(--black)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>No Orders Found</h2>
                  <p style={{ color: 'var(--gray-600)', margin: '0 0 32px', fontSize: '0.98rem', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                    Looks like you haven't placed any orders yet. Try our freshly made traditional Telugu sweets and hot savoury mixtures!
                  </p>
                  <Link href="/shop" className="btn btn-primary" style={{ textDecoration: 'none', padding: '16px 36px' }}>
                    Browse Hot & Fresh Snacks
                  </Link>
                </div>
              )}

              {/* ORDERS LIST */}
              {!loading && orders.map((order, idx) => {
                const normStatus = normalizeStatus(order.order_status);
                const meta = STATUS_META[normStatus] || STATUS_META['placed'];
                const isOpen = expanded === order.id;
                const td = trackData[order.id];
                const currentStep = STEPS.indexOf(normStatus);

                return (
                  <div key={order.id} className="order-card-wrapper animate-fadeup" style={{ animationDelay: `${idx * 0.08}s` }}>
                    
                    {/* Order Card Header Summary Row */}
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--cream-dark)', background: 'var(--cream-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Identifier</span>
                        <h3 style={{ margin: 0, fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 900, color: 'var(--red-dark)' }}>{order.id}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                          Placed on: <strong style={{ color: 'var(--black)' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Grand Total</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-dark)' }}>₹{order.total}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Mode</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                            {order.payment_mode === 'COD' ? '💵 Cash on Delivery' : '💳 Online UPI/Card'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                          <span style={{ padding: '6px 14px', borderRadius: '20px', background: meta.bg, color: meta.color, fontWeight: 800, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6, border: `1.5px solid ${meta.color}20` }}>
                            <span>{meta.icon}</span> {meta.label}
                          </span>
                          {order.expected_delivery_date && order.order_status !== 'delivered' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                              Est. Delivery: <strong>{order.expected_delivery_date}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Previews Summary Line & Expand Action Bar */}
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, background: '#fff' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {order.items?.slice(0, 3).map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', border: '1.5px solid var(--cream-dark)', borderRadius: '10px', background: 'var(--cream-light)' }}>
                            <div style={{ width: 40, height: 40, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-200)', flexShrink: 0 }}>
                              <Image src={getProductImage(item)} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--black)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-600)', fontWeight: 600 }}>{item.weight} × {item.qty}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)', fontWeight: 700, background: '#f5f5f5', padding: '6px 12px', borderRadius: '10px', border: '1.5px solid #eee' }}>+{order.items.length - 3} more items</span>
                        )}
                      </div>

                      <div>
                        <button onClick={() => toggleExpand(order.id)} className="btn-action-primary" style={{ minWidth: 160 }}>
                          {isOpen ? 'Collapse Details ▲' : 'Track & Details ▼'}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DETAILED AREA */}
                    {isOpen && (
                      <div style={{ padding: '28px 24px', borderTop: '1.5px solid var(--cream-dark)', background: '#fcfdfc', display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* 1. PROGRESS TIMELINE (DESKTOP AND MOBILE SEPARATE FOR BEST RESPONISIVENESS) */}
                        <OrderTimeline
                          orderStatus={order.order_status}
                          expectedDeliveryDate={order.expected_delivery_date}
                          trackingEvents={td?.tracking}
                        />

                        {/* 2. PRODUCTS SECTION DETAILED WITH INDIVIDUAL IMAGES */}
                        <div>
                          <h4 style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>🍴</span> Ordered Items Details
                          </h4>
                          <div style={{ border: '1px solid var(--cream-dark)', borderRadius: '12px', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.01)' }}>
                            {order.items?.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: i < (order.items?.length || 0) - 1 ? '1px solid #f2f2f2' : 'none', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                                  <div style={{ width: 72, height: 72, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--cream-dark)', flexShrink: 0 }}>
                                    <Image src={getProductImage(item)} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--black)' }}>{item.name}</p>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', background: 'var(--cream)', padding: '3px 10px', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: 700 }}>
                                      {item.weight} Pack
                                    </span>
                                    {order.order_status === 'delivered' && (
                                      (() => {
                                        const slug = item.product_id ? String(item.product_id) : item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                        const isReviewed = td?.reviews?.some(r => r.product_slug === slug);
                                        if (isReviewed) {
                                          return (
                                            <span style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: 4, width: 'fit-content', color: 'var(--green-dark)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                              <span>✓</span> Reviewed
                                            </span>
                                          );
                                        }
                                        return (
                                          <button onClick={() => openReviewModal(item, order.id)} className="btn-action-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: 4, width: 'fit-content' }}>
                                            ⭐ Rate & Write Review
                                          </button>
                                        );
                                      })()
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-600)', fontWeight: 600 }}>Unit Price</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.92rem', fontWeight: 700 }}>₹{item.price} × {item.qty}</p>
                                  </div>
                                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-600)', fontWeight: 600 }}>Total Price</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '1.02rem', fontWeight: 900, color: 'var(--green-dark)' }}>₹{item.price * item.qty}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. DOUBLE CARDS COLUMN: DELIVERY ADDRESS & PAYMENT CARDS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                          
                          {/* Delivery Address Card */}
                          <div style={{ border: '1px solid var(--cream-dark)', borderRadius: '12px', padding: '24px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid var(--cream-dark)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>📍</span> Shipping Address
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', lineHeight: 1.5 }}>
                              <strong style={{ color: 'var(--black)', fontSize: '1rem' }}>{order.customer_name}</strong>
                              <span style={{ color: 'var(--gray-600)', fontWeight: 600 }}>📞 {order.phone}</span>
                              <p style={{ margin: '4px 0 0', color: 'var(--gray-800)' }}>
                                {order.address}
                              </p>
                              <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{order.city}, {order.state} - {order.pincode}</span>
                            </div>
                          </div>

                          {/* Payment Card Info */}
                          <div style={{ border: '1px solid var(--cream-dark)', borderRadius: '12px', padding: '24px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid var(--cream-dark)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>💳</span> Payment Information
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Method:</span>
                                <strong style={{ color: 'var(--black)' }}>
                                  {order.payment_mode === 'COD' ? '💵 Cash On Delivery' : '💳 Online Payment'}
                                </strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Status:</span>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: order.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: order.payment_status === 'paid' ? '#2e7d32' : '#e65100', fontSize: '0.78rem', fontWeight: 800, border: `1px solid ${order.payment_status === 'paid' ? '#c8e6c9' : '#ffe082'}` }}>
                                  {order.payment_status === 'paid' ? '✔ Paid' : 'Pending'}
                                </span>
                              </div>
                              
                              <div style={{ borderTop: '1px dashed var(--cream-dark)', paddingTop: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal || (order.total - (order.shipping || 0) - (order.cod_charge || 0))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                  <span>Shipping Charges:</span>
                                  <span>₹{order.shipping || 0}</span>
                                </div>
                                {order.cod_charge ? (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                    <span>COD Convenience Fee:</span>
                                    <span>₹{order.cod_charge}</span>
                                  </div>
                                ) : null}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--cream-dark)', paddingTop: '10px', marginTop: '4px', fontSize: '1.1rem', fontWeight: 900, color: 'var(--green-dark)' }}>
                                  <span>Grand Total:</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* 4. HISTORICAL DETAILED TIMELINE LOGGER */}
                        {td?.tracking && td.tracking.length > 0 && (
                          <div style={{ background: 'var(--cream-light)', borderRadius: '12px', border: '1px solid var(--cream-dark)', padding: '20px' }}>
                            <h5 style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--gray-800)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>📋</span> Detailed Activity Logs
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              {td.tracking.map((ev, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: i === 0 ? 'var(--green)' : 'var(--gold)', flexShrink: 0, marginTop: 4 }} />
                                    {i < td.tracking.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--cream-dark)', marginTop: 4 }} />}
                                  </div>
                                  <div>
                                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--black)' }}>
                                      {STATUS_META[ev.status]?.icon || '📍'} {STATUS_META[ev.status]?.label || ev.status}
                                    </p>
                                    <p style={{ margin: '2px 0 0', color: 'var(--gray-600)', fontSize: '0.82rem', lineHeight: 1.4 }}>{ev.message}</p>
                                    <p style={{ margin: '4px 0 0', color: 'var(--gray-400)', fontSize: '0.72rem', fontWeight: 600 }}>
                                      {new Date(ev.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Return Request Summary Details */}
                        {td?.returnRequest && (
                          <div style={{ background: td.returnRequest.status === 'Approved' ? '#e8f5e9' : td.returnRequest.status === 'Rejected' ? '#fce4ec' : '#fff8e1', borderRadius: '12px', padding: '18px 20px', border: `1px solid ${td.returnRequest.status === 'Approved' ? '#c8e6c9' : td.returnRequest.status === 'Rejected' ? '#f8bbd0' : '#ffe082'}` }}>
                            <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '0.92rem', color: '#333' }}>
                              🔁 Return Request Status: <strong style={{ color: td.returnRequest.status === 'Approved' ? '#2e7d32' : td.returnRequest.status === 'Rejected' ? '#c62828' : '#f57c00' }}>{td.returnRequest.status}</strong>
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#444' }}><strong>Reason reported:</strong> {td.returnRequest.reason}</p>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#777' }}>Submitted on: {new Date(td.returnRequest.created_at).toLocaleDateString('en-IN')}</p>
                          </div>
                        )}

                        {/* Amazon-Style Return Window Status */}
                        {order.order_status === 'delivered' && !td?.returnRequest && (
                          <div style={{ padding: '16px 20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee', marginTop: 12 }}>
                            {(() => {
                              const returnInfo = getReturnStatusInfo(order);
                              if (returnInfo?.eligible) {
                                let color = 'var(--gray-600)';
                                let icon = '⏳';
                                if (returnInfo.warnLevel === 'critical') {
                                  color = 'var(--red)';
                                  icon = '🚨';
                                } else if (returnInfo.warnLevel === 'warning') {
                                  color = '#e65100'; // Orange
                                  icon = '⚠️';
                                }
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                      <div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Return Window:
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 800, color, display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <span>{icon}</span> {returnInfo.text}
                                        </p>
                                      </div>
                                      <Link href={`/my-orders/return?orderId=${order.id}`} className="btn-action-secondary" style={{ background: '#fff', color: '#111', borderColor: '#d5d9d9', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', padding: '10px 20px', minWidth: 160 }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>↩ Return Item</span>
                                      </Link>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>❌</span> Return window expired
                                  </p>
                                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                                    This order is no longer eligible for returns because food/snack products can only be returned within 24 hours of delivery.
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* 5. MULTI-ACTIONS ROW PANEL */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1.5px solid var(--cream-dark)', paddingTop: '22px', justifyContent: 'flex-start' }}>
                          <Link href={`/track?id=${order.id}`} className="btn-action-primary">
                            📦 Live Tracking Radar
                          </Link>
                          
                          <button onClick={() => handleReorder(order)} className="btn-action-secondary">
                            🔄 Reorder Snacks
                          </button>
                          
                          <button onClick={() => handlePrintInvoice(order)} className="btn-action-secondary">
                            📄 Print Invoice
                          </button>

                          {canCancel(order) && (
                            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I would like to cancel my order %23${order.id}. Please assist.`}
                              target="_blank" rel="noopener noreferrer" className="btn-action-danger">
                              🚫 Cancel Order
                            </a>
                          )}

                          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I have a question about my order %23${order.id}`}
                            target="_blank" rel="noopener noreferrer" className="btn-action-secondary">
                            💬 WhatsApp Help Desk
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Shop More button */}
              {orders.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <Link href="/shop" className="btn-action-primary" style={{ padding: '14px 32px', borderRadius: '30px', fontSize: '1.05rem', textDecoration: 'none' }}>
                    🛍️ Shop More Products
                  </Link>
                </div>
              )}
            </div>

            {/* Right Support & FAQ Sidebar Column */}
            <div className="sidebar-panel">
              
              {/* Quick WhatsApp Support */}
              <div className="sidebar-card text-center" style={{ display: 'flex', flexDirection: 'column', gap: 16, border: '1.5px solid var(--cream-dark)' }}>
                <span style={{ fontSize: '2.5rem' }}>👩‍🍳</span>
                <h3 style={{ color: 'var(--green-dark)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Need Snacking Help?</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  Have questions about your delivery status, spice preferences, or bulk ordering? Chat with us instantly.
                </p>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I need help with my DesiSwaad orders.`}
                  target="_blank" rel="noopener noreferrer" className="btn-action-primary" style={{ width: '100%' }}>
                  💬 WhatsApp Support
                </a>
              </div>

              {/* Quick FAQs */}
              <div className="sidebar-card" style={{ border: '1.5px solid var(--cream-dark)' }}>
                <h4 style={{ color: 'var(--black)', margin: '0 0 16px', fontSize: '0.98rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid var(--cream-dark)', paddingBottom: '10px' }}>
                  Frequently Asked FAQs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--black)', display: 'block', marginBottom: 4 }}>🚚 How long does delivery take?</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                      Local orders in Hyderabad are delivered within 24 hours. Outstation shipments take 2-4 days.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--black)', display: 'block', marginBottom: 4 }}>🏠 Can I modify my address?</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                      Yes, before order prepares. Please ping us on WhatsApp immediately with your order ID.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--black)', display: 'block', marginBottom: 4 }}>🔁 What is the return window?</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                      Due to the perishable nature of food, issues must be reported within 24 hours of delivery.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Review & Rating Modal */}
      {reviewModalOpen && reviewItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '460px', margin: '20px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--cream-dark)' }}>
            <button onClick={() => setReviewModalOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#888', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 6, fontWeight: 800, color: 'var(--green-dark)', fontFamily: 'var(--font-heading)' }}>⭐ Rate & Review Product</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 24, fontSize: '0.92rem' }}>
              Your feedback helps us maintain authentic home-made taste!<br />
              Product: <strong>{reviewItem.item.name}</strong> ({reviewItem.item.weight})
            </p>

            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                <h3 style={{ color: 'var(--green)', fontSize: '1.25rem', marginBottom: 8, fontWeight: 800 }}>Review Submitted!</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Thank you for sharing your experience!</p>
              </div>
            ) : (
              <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Rating *</label>
                  <div style={{ display: 'flex', gap: 10, fontSize: '2.8rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => setRating(star)} style={{ color: star <= rating ? 'var(--gold-light)' : '#e5e7eb', transition: 'color 0.15s', lineHeight: 1 }}>★</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.85rem', color: 'var(--gray-800)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Comments *</label>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required placeholder="How is the crunch, spice level, and freshness?" rows={4}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--gray-200)', borderRadius: '8px', resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
                </div>
                {reviewError && <p style={{ color: 'var(--red)', fontSize: '0.85rem', margin: 0 }}>⚠️ {reviewError}</p>}
                <button type="submit" disabled={reviewLoading} className="btn-action-primary" style={{ padding: '14px', fontSize: '0.95rem' }}>
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
