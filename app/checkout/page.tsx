'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { useAuthStore, authHeaders } from '@/lib/authStore';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// =============================================
// ORDER SUCCESS SCREEN — Animated Component
// =============================================
function OrderSuccessScreen({ orderId, paymentMode, grandTotal }: { orderId: string; paymentMode: string; grandTotal: number }) {
  const router = useRouter();
  // Phase: 0=processing, 1=payment-success, 2=order-confirmed
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(8);
  const [truckPos, setTruckPos] = useState(-10); // percentage across screen

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Truck animation when confirmed
  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setTruckPos(prev => {
        if (prev >= 110) return -10;
        return prev + 0.6;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [phase]);

  // Countdown redirect
  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push(`/track?id=${orderId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, orderId, router]);

  // Phase 0: Processing
  if (phase === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1f17 0%, #1E5B3A 100%)',
        flexDirection: 'column', gap: 24, padding: 40,
      }}>
        <style>{`
          @keyframes spin360 { to { transform: rotate(360deg); } }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes ds-fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ds-checkDraw {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes ds-circleDraw {
            from { stroke-dashoffset: 314; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes ds-scaleIn {
            0% { transform: scale(0.3); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            80% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes ds-slideFade {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes ds-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3), 0 0 40px rgba(212,175,55,0.1); }
            50% { box-shadow: 0 0 40px rgba(212,175,55,0.6), 0 0 80px rgba(212,175,55,0.2); }
          }
          @keyframes ds-truck-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes ds-confetti-fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
          }
          @keyframes ds-countPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes ds-roadMove {
            from { background-position: 0 0; }
            to { background-position: -80px 0; }
          }
          @keyframes ds-stepIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Spinner */}
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid rgba(212,175,55,0.15)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#D4AF37',
            borderRightColor: '#D4AF37',
            animation: 'spin360 0.9s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(212,175,55,0.4)',
            animation: 'spin360 1.4s linear infinite reverse',
          }} />
        </div>

        <div style={{ textAlign: 'center', animation: 'ds-fadeUp 0.5s ease forwards' }}>
          <p style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
            {paymentMode === 'cod' ? 'Placing Order...' : 'Processing Payment...'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: 8 }}>
            Please don't close this window
          </p>
        </div>
      </div>
    );
  }

  // Phase 1: Payment Success flash
  if (phase === 1) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1f17 0%, #1E5B3A 100%)',
        flexDirection: 'column', gap: 32, padding: 40,
      }}>
        {/* Animated SVG Checkmark */}
        <div style={{ position: 'relative', animation: 'ds-scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          {/* Pulse rings */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            border: '2px solid rgba(30,91,58,0.6)',
            animation: 'pulse-ring 1s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            border: '2px solid rgba(30,91,58,0.4)',
            animation: 'pulse-ring 1s ease-out 0.3s infinite',
          }} />

          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Circle */}
            <circle cx="60" cy="60" r="50" fill="#1E5B3A" stroke="#2d7a4f" strokeWidth="2" />
            {/* Animated circle border */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="#D4AF37" strokeWidth="3"
              strokeDasharray="314" strokeDashoffset="314"
              strokeLinecap="round"
              style={{ animation: 'ds-circleDraw 0.6s ease-out 0.1s forwards', transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }}
            />
            {/* Checkmark */}
            <polyline points="35,62 52,78 85,42" fill="none" stroke="#fff" strokeWidth="7"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="100" strokeDashoffset="100"
              style={{ animation: 'ds-checkDraw 0.4s ease-out 0.5s forwards' }}
            />
          </svg>
        </div>

        <div style={{ textAlign: 'center', animation: 'ds-fadeUp 0.5s ease 0.7s both' }}>
          <p style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            {paymentMode === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>
            {paymentMode === 'cod' ? 'Order accepted — pay on delivery' : 'Your payment was processed securely via Razorpay'}
          </p>
        </div>
      </div>
    );
  }

  // Phase 2: Full Order Confirmed Screen
  const nextSteps = [
    { icon: '📧', title: 'Confirmation Email', desc: 'Sent to your email with order details' },
    { icon: '👨‍🍳', title: 'Being Prepared', desc: 'Our team starts packing your snacks' },
    { icon: '🚚', title: 'Shipped', desc: 'Dispatched within 1–2 business days' },
    { icon: '🎉', title: 'Delivered', desc: 'Enjoy your DesiSwad snacks!' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f7f3e9 0%, #fffdf8 60%, #edf7f1 100%)',
      overflow: 'hidden',
    }}>
      {/* Confetti particles */}
      {['#D4AF37','#1E5B3A','#B22222','#fff','#f59e0b'].map((color, i) => (
        <div key={i} style={{
          position: 'fixed', top: -20, left: `${10 + i * 20}%`,
          width: 10, height: 10, borderRadius: i % 2 === 0 ? '50%' : '2px',
          background: color, zIndex: 0,
          animation: `ds-confetti-fall ${1.5 + i * 0.3}s ease-out ${i * 0.15}s both`,
          pointerEvents: 'none',
        }} />
      ))}
      {['#D4AF37','#B22222','#1E5B3A','#fff','#f59e0b'].map((color, i) => (
        <div key={`b${i}`} style={{
          position: 'fixed', top: -20, left: `${5 + i * 18}%`,
          width: 7, height: 14, borderRadius: 2,
          background: color, zIndex: 0,
          animation: `ds-confetti-fall ${2 + i * 0.2}s ease-out ${0.1 + i * 0.2}s both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 60,
        boxShadow: '0 4px 20px rgba(30,91,58,0.25)',
      }}>
        <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.2rem' }}>🌿 DesiSwad Foods</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 12, fontSize: '0.85rem' }}>Order Confirmed</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* ✅ Big Success Card */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
          marginBottom: 20,
          animation: 'ds-scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
          border: '1px solid #e8e8e8',
        }}>
          {/* Green success top */}
          <div style={{
            background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)',
            padding: '40px 32px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative ring */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

            {/* SVG Check */}
            <div style={{ display: 'inline-block', animation: 'ds-glow 2s ease-in-out infinite', borderRadius: '50%', marginBottom: 20 }}>
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="48" fill="rgba(255,255,255,0.12)" />
                <circle cx="48" cy="48" r="40" fill="rgba(255,255,255,0.1)" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
                <circle cx="48" cy="48" r="32" fill="#D4AF37" />
                <polyline points="30,50 43,62 66,36" fill="none" stroke="#1E5B3A" strokeWidth="6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
              Order Confirmed! 🎉
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem' }}>
              Thank you for choosing DesiSwad Foods
            </p>
          </div>

          {/* Order ID reveal */}
          <div style={{
            padding: '28px 32px',
            borderBottom: '1px solid #f0f0f0',
            animation: 'ds-fadeUp 0.5s ease 0.3s both',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Your Order ID</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg, #fdfaf4, #fff8e8)',
                border: '2px solid #D4AF37',
                borderRadius: 12,
                padding: '12px 20px',
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#B22222',
                letterSpacing: '0.05em',
                flex: 1,
                textAlign: 'center',
              }}>
                {orderId}
              </div>
              <button
                onClick={() => { navigator.clipboard?.writeText(orderId); }}
                title="Copy Order ID"
                style={{ padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: 10, background: '#f8f8f8', cursor: 'pointer', fontSize: '0.82rem', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' }}>
                📋 Copy ID
              </button>
            </div>
          </div>

          {/* Amount + Payment */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid #f0f0f0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            animation: 'ds-fadeUp 0.5s ease 0.45s both',
          }}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f9fbf9', borderRadius: 10, border: '1px solid #e8f5e9' }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Total Paid</p>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1E5B3A' }}>₹{grandTotal}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#fdfaf4', borderRadius: 10, border: '1px solid #f5e8b8' }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Payment</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#b8860b' }}>
                {paymentMode === 'cod' ? '💵 Cash on Delivery' : '✅ Online Paid'}
              </p>
            </div>
          </div>

          {/* Delivery Scooter Animation */}
          <div style={{
            padding: '24px 0 0',
            overflow: 'hidden',
            position: 'relative',
            borderBottom: '1px solid #f0f0f0',
            animation: 'ds-fadeUp 0.5s ease 0.6s both',
          }}>
            <p style={{ textAlign: 'center', margin: '0 0 16px', fontSize: '0.82rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your delivery is on its way 🛵
            </p>

            {/* Road */}
            <div style={{
              position: 'relative',
              height: 56,
              background: '#f5f5f5',
              borderTop: '2px solid #e0e0e0',
              overflow: 'hidden',
            }}>
              {/* Road dash lines */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 3,
                backgroundImage: 'repeating-linear-gradient(90deg, #D4AF37 0, #D4AF37 30px, transparent 30px, transparent 60px)',
                backgroundSize: '80px 3px',
                animation: 'ds-roadMove 0.6s linear infinite',
                transform: 'translateY(-50%)',
                opacity: 0.5,
              }} />

              {/* Scooter */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: `${truckPos}%`,
                transform: 'translateY(-50%)',
                fontSize: '2.2rem',
                lineHeight: 1,
                animation: 'ds-truck-bounce 0.4s ease-in-out infinite',
                transition: 'left 0.02s linear',
                filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.1))',
                userSelect: 'none',
              }}>
                <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🛵</span>
              </div>

              {/* House destination */}
              <div style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.8rem',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))',
              }}>🏠</div>
            </div>
          </div>

          {/* Auto-redirect countdown */}
          <div style={{
            padding: '20px 32px',
            animation: 'ds-fadeUp 0.5s ease 0.75s both',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#888' }}>
              Redirecting to order tracking in
            </p>
            <span style={{
              display: 'inline-block',
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#1E5B3A',
              animation: 'ds-countPulse 1s ease-in-out infinite',
              lineHeight: 1,
            }}>
              {countdown}
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bbb' }}>seconds</p>
          </div>
        </div>

        {/* Next Steps Timeline */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 20,
          border: '1px solid #e8e8e8',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          animation: 'ds-fadeUp 0.5s ease 0.9s both',
        }}>
          <p style={{ margin: '0 0 20px', fontWeight: 700, color: '#333', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📍 What Happens Next
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {nextSteps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                paddingBottom: i < nextSteps.length - 1 ? 20 : 0,
                position: 'relative',
                animation: `ds-stepIn 0.4s ease ${1 + i * 0.12}s both`,
              }}>
                {/* Vertical line */}
                {i < nextSteps.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 19, top: 40, bottom: 0,
                    width: 2, background: '#e8e8e8',
                  }} />
                )}
                {/* Icon circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#e8f5e9' : '#f5f5f5',
                  border: `2px solid ${i === 0 ? '#4caf50' : '#e0e0e0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  zIndex: 1,
                }}>
                  {step.icon}
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#222', fontSize: '0.9rem' }}>{step.title}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.82rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          animation: 'ds-fadeUp 0.5s ease 1.4s both',
        }}>
          <Link
            href={`/track?id=${orderId}`}
            style={{
              flex: 1, textAlign: 'center', padding: '16px 20px',
              background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)',
              color: '#fff', borderRadius: 14, fontWeight: 800,
              textDecoration: 'none', fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(30,91,58,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            📦 Track My Order
          </Link>
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919640497340'}?text=Hi! I just placed Order ID: ${orderId}. Can you confirm it?`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, textAlign: 'center', padding: '16px 20px',
              background: '#25D366', color: '#fff', borderRadius: 14, fontWeight: 700,
              textDecoration: 'none', fontSize: '0.95rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            💬 WhatsApp Confirm
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, animation: 'ds-fadeUp 0.5s ease 1.6s both' }}>
          <Link href="/shop" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'underline' }}>
            Continue Shopping →
          </Link>
        </div>

      </div>
    </div>
  );
}

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Lakshadweep','Andaman and Nicobar Islands','Dadra and Nagar Haveli','Daman and Diu'];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/checkout');
    }
  }, [isLoggedIn, router]);

  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Payment, 3: Review
  const [isSuccess, setIsSuccess] = useState(false);
  const [isIndia, setIsIndia] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: '', city: '', state: 'Telangana', pincode: '', country: 'India',
  });

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setAddressesLoading(true);
      fetch('/api/addresses', { headers: authHeaders() as any })
        .then(r => r.json())
        .then(d => {
          const list = d.addresses || [];
          setSavedAddresses(list);
          const def = list.find((a: any) => a.is_default);
          if (def) {
            setForm({
              name: def.recipient_name,
              email: user?.email || '',
              phone: def.phone,
              address: def.address_line,
              city: def.city,
              state: def.state,
              pincode: def.pincode,
              country: def.country,
            });
            const ind = def.country === 'India';
            setIsIndia(ind);
            if (!ind) setPaymentMode('online');
          }
        })
        .catch(console.error)
        .finally(() => setAddressesLoading(false));
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (user && savedAddresses.length === 0) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user, savedAddresses]);

  const subtotal = total();
  const shipping = isIndia ? (subtotal >= 499 ? 0 : 60) : 999;
  const codCharge = isIndia && paymentMode === 'cod' ? 30 : 0;
  const grand = subtotal + shipping + codCharge;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'country') {
      const ind = value === 'India';
      setIsIndia(ind);
      if (!ind) setPaymentMode('online');
    }
  };

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleValidationStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep(2);
  };

  const handleValidationStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep(3);
  };

  const handlePlaceOrder = async () => {
    if (paymentMode === 'cod') {
      await handleCOD();
    } else {
      await handleOnlinePayment();
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}` 
        },
        body: JSON.stringify({
          ...form,
          customer_name: form.name,
          items: items.map(i => ({ id: i.id, name: i.name, weight: i.weight, qty: i.quantity, price: i.price })),
          subtotal, shipping, cod_charge: codCharge, total: grand,
          payment_mode: 'COD',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.orderId) {
        setOrderId(data.orderId);
        clearCart();
        setIsSuccess(true);
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again or order via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    
    // 1. Create the order in the database first (with payment_status: pending)
    let dbOrderId = '';
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}` 
        },
        body: JSON.stringify({
          ...form,
          customer_name: form.name,
          items: items.map(i => ({ id: i.id, name: i.name, weight: i.weight, qty: i.quantity, price: i.price })),
          subtotal, shipping, cod_charge: 0, total: grand,
          payment_mode: 'Online',
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create pending order.');
      }
      dbOrderId = orderData.orderId;
    } catch (err: any) {
      alert(err.message || 'Failed to initialize order. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Load Razorpay script
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Could not load Razorpay. Check your internet connection.');
      setLoading(false);
      return;
    }

    // 3. Create the payment session on Razorpay
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grand, receipt: dbOrderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment gateway session.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'DesiSwad Foods',
        description: 'Authentic Telangana Snacks Order',
        image: '/logo.png',
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on the backend using our database order ID
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, order_id: dbOrderId }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setOrderId(dbOrderId);
              clearCart();
              setIsSuccess(true);
            } else {
              alert(verifyData.error || 'Payment verification failed. Please check your order tracking status.');
              // Redirect to tracking page anyway since order exists
              router.push(`/track?id=${dbOrderId}`);
            }
          } catch (err) {
            alert('Error verifying payment. Your order has been placed but payment status is pending.');
            router.push(`/track?id=${dbOrderId}`);
          }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#f59e0b' },
        modal: { ondismiss: () => setLoading(false) },
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed. Please check your order status under tracking.');
      setLoading(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
        <h2 className="heading-lg" style={{ marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: '#9E9E9E', marginBottom: 28 }}>Add some delicious snacks before checking out!</p>
        <Link href="/shop" className="btn btn-primary btn-lg">Browse Snacks</Link>
      </div>
    );
  }

  if (isSuccess) {
    return <OrderSuccessScreen orderId={orderId} paymentMode={paymentMode} grandTotal={grand} />;
  }

  return (
    <>
      <div className="checkout-hero" style={{ background: '#232f3e', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 className="heading-lg" style={{ color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔒</span> Secure Checkout
          </h1>
        </div>
      </div>

      <div className="container checkout-layout" style={{ paddingTop: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Accordion Left Side */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* STEP 1: ADDRESS */}
          <div className={`checkout-step-card ${checkoutStep === 1 ? 'active' : ''}`} style={{ background: '#fff', border: checkoutStep === 1 ? '1px solid #f59e0b' : '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="checkout-step-header" style={{ background: checkoutStep === 1 ? '#fff7ed' : '#f8f8f8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: checkoutStep > 1 ? 'pointer' : 'default' }} onClick={() => checkoutStep > 1 && setCheckoutStep(1)}>
              <h2 style={{ fontSize: '1.2rem', color: checkoutStep === 1 ? '#c2410c' : '#333', fontWeight: 700 }}>
                1. Delivery Address
              </h2>
              {checkoutStep > 1 && <span style={{ color: '#007185', fontSize: '0.9rem', fontWeight: 600 }}>Change</span>}
            </div>
            
            {checkoutStep === 1 && (
              <div className="checkout-step-body" style={{ padding: '24px' }}>
                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom: 20, background: '#fcfcfc', border: '1.5px solid #eee', borderRadius: 12, padding: 18 }}>
                    <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 700, color: '#1E5B3A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Use Saved Address</p>
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                      {savedAddresses.map((addr) => {
                        const isSelected = form.address === addr.address_line && form.pincode === addr.pincode;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setForm({
                                name: addr.recipient_name,
                                email: user?.email || '',
                                phone: addr.phone,
                                address: addr.address_line,
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                country: addr.country,
                              });
                              const ind = addr.country === 'India';
                              setIsIndia(ind);
                              if (!ind) setPaymentMode('online');
                            }}
                            style={{
                              flex: '0 0 200px',
                              padding: 12,
                              background: '#fff',
                              border: isSelected ? '2px solid #1E5B3A' : '1.5px solid #ddd',
                              borderRadius: 10,
                              cursor: 'pointer',
                              boxShadow: isSelected ? '0 4px 12px rgba(30,91,58,0.1)' : 'none',
                              transition: 'all 0.2s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ fontSize: '0.82rem', color: '#333' }}>{addr.name}</strong>
                              {addr.is_default && <span style={{ fontSize: '0.65rem', color: '#1E5B3A', background: '#e8f5e9', padding: '1px 5px', borderRadius: 4 }}>Default</span>}
                            </div>
                            <p style={{ margin: '0 0 4px', fontSize: '0.78rem', fontWeight: 600, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.recipient_name}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.address_line}</p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#888' }}>{addr.city}, {addr.pincode}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <form onSubmit={handleValidationStep1}>
                  <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name *</label>
                      <input className="form-input" style={{ width: '100%', padding: '10px' }} name="name" value={form.name} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Phone Number *</label>
                      <input className="form-input" style={{ width: '100%', padding: '10px' }} name="phone" value={form.phone} onChange={handleFormChange} required type="tel" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address *</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px' }} name="email" value={form.email} onChange={handleFormChange} required type="email" />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>House No., Building, Street *</label>
                    <input className="form-input" style={{ width: '100%', padding: '10px' }} name="address" value={form.address} onChange={handleFormChange} required />
                  </div>
                  <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>City *</label>
                      <input className="form-input" style={{ width: '100%', padding: '10px' }} name="city" value={form.city} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Country *</label>
                      <select className="form-input" style={{ width: '100%', padding: '10px' }} name="country" value={form.country} onChange={handleFormChange} required>
                        <option value="India">India</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="UAE">UAE</option>
                        <option value="Other">Other Country</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    {isIndia && (
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>State *</label>
                        <select className="form-input" style={{ width: '100%', padding: '10px' }} name="state" value={form.state} onChange={handleFormChange} required>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {isIndia && (
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.9rem' }}>PIN Code *</label>
                        <input className="form-input" style={{ width: '100%', padding: '10px' }} name="pincode" value={form.pincode} onChange={handleFormChange} required maxLength={6} />
                      </div>
                    )}
                  </div>
                  <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>
                      <strong style={{ color: '#0f1111' }}>Delivery instructions (Optional):</strong> Please note if this is a secure building or gated community.
                    </p>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ background: '#f8c146', color: '#111', border: '1px solid #a88734', padding: '10px 24px', fontWeight: 500, boxShadow: '0 1px 0 rgba(255,255,255,.4) inset' }}>
                    Use this address
                  </button>
                </form>
              </div>
            )}
            
            {checkoutStep > 1 && (
              <div style={{ padding: '0 24px 16px', color: '#555', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}><strong>{form.name}</strong></p>
                <p style={{ margin: 0 }}>{form.address}, {form.city}, {form.state} {form.pincode}, {form.country}</p>
                <p style={{ margin: 0 }}>Phone: {form.phone}</p>
              </div>
            )}
          </div>

           {/* STEP 2: PAYMENT METHOD */}
          <div className={`checkout-step-card ${checkoutStep === 2 ? 'active' : ''}`} style={{ background: '#fff', border: checkoutStep === 2 ? '1px solid #f59e0b' : '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="checkout-step-header" style={{ background: checkoutStep === 2 ? '#fff7ed' : '#f8f8f8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: checkoutStep > 2 ? 'pointer' : 'default' }} onClick={() => checkoutStep > 2 && setCheckoutStep(2)}>
              <h2 style={{ fontSize: '1.2rem', color: checkoutStep === 2 ? '#c2410c' : '#333', fontWeight: 700 }}>
                2. Payment Method
              </h2>
              {checkoutStep > 2 && <span style={{ color: '#007185', fontSize: '0.9rem', fontWeight: 600 }}>Change</span>}
            </div>
            
            {checkoutStep === 2 && (
              <div className="checkout-step-body" style={{ padding: '24px' }}>
                <form onSubmit={handleValidationStep2}>
                  {!isIndia && (
                    <div style={{ background: '#fdfaf4', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #f5ce7a', fontSize: '0.9rem', color: '#555' }}>
                      🌍 <strong>International orders</strong> are prepaid only.
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    
                    {/* Online Payment Option */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: paymentMode === 'online' ? '1px solid #f59e0b' : '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', background: paymentMode === 'online' ? '#fffbed' : '#fff', transition: 'all 0.2s' }}>
                      <input type="radio" value="online" checked={paymentMode === 'online'} onChange={() => setPaymentMode('online')} style={{ marginTop: '4px' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#111', fontSize: '1rem' }}>Credit/Debit Card, Netbanking or UPI</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#555' }}>Secure online payment via Razorpay. Accepts Google Pay, PhonePe, and all major cards.</p>
                      </div>
                    </label>

                    {/* Cash on Delivery Option */}
                    {isIndia && (
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: paymentMode === 'cod' ? '1px solid #f59e0b' : '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', background: paymentMode === 'cod' ? '#fffbed' : '#fff', transition: 'all 0.2s' }}>
                        <input type="radio" value="cod" checked={paymentMode === 'cod'} onChange={() => setPaymentMode('cod')} style={{ marginTop: '4px' }} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: '#111', fontSize: '1rem' }}>Cash on Delivery / Pay on Delivery</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#555' }}>Pay using cash or UPI at the time of delivery. A standard ₹30 convenience charge applies.</p>
                        </div>
                      </label>
                    )}

                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ background: '#f8c146', color: '#111', border: '1px solid #a88734', padding: '10px 24px', fontWeight: 500, boxShadow: '0 1px 0 rgba(255,255,255,.4) inset' }}>
                    Use this payment method
                  </button>
                </form>
              </div>
            )}

            {checkoutStep > 2 && (
              <div style={{ padding: '0 24px 16px', color: '#555', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}><strong>{paymentMode === 'online' ? 'Credit/Debit Card, UPI (Razorpay)' : 'Cash / Pay on Delivery'}</strong></p>
              </div>
            )}
          </div>

          {/* STEP 3: ITEMS AND SHIPPING */}
          <div className={`checkout-step-card ${checkoutStep === 3 ? 'active' : ''}`} style={{ background: '#fff', border: checkoutStep === 3 ? '1px solid #f59e0b' : '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
             <div className="checkout-step-header" style={{ background: checkoutStep === 3 ? '#fff7ed' : '#f8f8f8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', color: checkoutStep === 3 ? '#c2410c' : '#333', fontWeight: 700 }}>
                3. Review items and shipping
              </h2>
            </div>
            
            {checkoutStep === 3 && (
              <div className="checkout-step-body" style={{ padding: '24px' }}>
                
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Guaranteed Delivery matching authentic taste</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map((item) => (
                      <div key={`${item.id}-${item.weight}`} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '80px', height: '80px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', background: '#fafafa', flexShrink: 0 }}>
                          <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#111' }}>{item.name} - {item.weight}</p>
                          <p style={{ margin: '0 0 4px', color: '#B22222', fontWeight: 700 }}>₹{item.price * item.quantity}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button type="button" onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary" style={{ width: '200px', padding: '12px', background: '#ffd814', color: '#111', border: '1px solid #fcd200', borderRadius: '100px', fontWeight: 600, boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)' }}>
                      {loading ? 'Processing...' : 'Place your order'}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '12px' }}>By placing your order, you agree to DesiSwad's privacy notice and conditions of use.</p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Amazon-like Right Side Order Summary */}
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', position: 'sticky', top: '90px' }}>
            
            {checkoutStep === 3 ? (
               <button type="button" onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', background: '#ffd814', color: '#111', border: '1px solid #fcd200', borderRadius: '100px', fontWeight: 600, boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)', marginBottom: '16px' }}>
                {loading ? 'Processing...' : 'Place your order'}
              </button>
            ) : (
               <button type="button" disabled className="btn btn-primary" style={{ width: '100%', padding: '12px', background: '#f5f6f6', color: '#a6a6a6', border: '1px solid #e0e0e0', borderRadius: '100px', fontWeight: 600, marginBottom: '16px' }}>
                Place your order
              </button>
            )}

            <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
              Choose a shipping address and payment method to continue checking out.
            </p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items:</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span><span>₹{shipping.toFixed(2)}</span>
              </div>
              {codCharge > 0 && checkoutStep > 1 && paymentMode === 'cod' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>COD Fee:</span><span>₹{codCharge.toFixed(2)}</span>
                </div>
              )}
              
              <div style={{ paddingTop: '16px', marginTop: '8px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#B22222', fontSize: '1.2rem' }}>
                <span>Order Total:</span><span>₹{grand.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
