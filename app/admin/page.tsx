'use client';
import { useState, useEffect, useCallback } from 'react';

type OrderItem = { id: string; name: string; weight: string; qty: number; price: number; product_slug?: string };
type NotificationItem = { type: string; subject: string; status: string; timestamp: string };
type TrackingEvent = { status: string; message: string; timestamp: string };
type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  notes?: string;
  items: OrderItem[];
  notifications?: NotificationItem[];
  tracking?: TrackingEvent[];
  subtotal?: number;
  shipping?: number;
  cod_charge?: number;
  total: number;
  payment_mode: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  delivery_partner?: string;
  tracking_number?: string;
  expected_delivery_date?: string;
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  onlineRevenue: number;
};

const STATUS_FLOW = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  placed:     'Pending',
  confirmed:  'Confirmed',
  processing: 'Preparing',
  shipped:    'Out for Delivery',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  placed:     { bg: '#fff8e1', text: '#f57f17', border: '#ffca28' },
  confirmed:  { bg: '#e3f2fd', text: '#1565c0', border: '#42a5f5' },
  processing: { bg: '#fff3e0', text: '#e65100', border: '#ffa726' },
  shipped:    { bg: '#e8f5e9', text: '#1b5e20', border: '#66bb6a' },
  delivered:  { bg: '#e8f5e9', text: '#1E5B3A', border: '#2e7d32' },
  cancelled:  { bg: '#fce4ec', text: '#880e4f', border: '#f06292' },
};

const STAT_CARDS = [
  { key: 'totalOrders', label: 'Total Orders', icon: '📦', color: '#1E5B3A', bg: '#e8f5e9' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: '💰', color: '#b8860b', bg: '#fdfaf4', prefix: '₹' },
  { key: 'pendingOrders', label: 'Active Orders', icon: '⏳', color: '#e65100', bg: '#fff3e0' },
  { key: 'deliveredOrders', label: 'Delivered', icon: '✅', color: '#1565c0', bg: '#e3f2fd' },
];

const WHATSAPP_NUM = '919640497340';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delivery details modal state
  const [shipModal, setShipModal] = useState<{ orderId: string; status: string } | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState('');
  const [trackingNum, setTrackingNum] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/stats'),
      ]);
      const ordersData = await ordersRes.json();
      const statsRaw = await statsRes.json();

      const mappedOrders = (ordersData.orders || []).map((o: any) => ({
        ...o.order,
        items: o.items || [],
        tracking: o.tracking || []
      }));
      setOrders(mappedOrders);

      // Backend returns { stats: { total_orders, total_sales, pending_returns } }
      // Map to the shape the frontend Stats type expects
      const s = statsRaw?.stats || statsRaw || {};
      const todayStr = new Date().toDateString();
      const todayCount = mappedOrders.filter(
        (o: any) => new Date(o.created_at).toDateString() === todayStr
      ).length;
      setStats({
        totalOrders:     s.total_orders    ?? 0,
        totalRevenue:    s.total_sales     ?? 0,
        pendingOrders:   mappedOrders.filter((o: any) => o.status === 'Pending' || o.status === 'Order Confirmed').length,
        deliveredOrders: mappedOrders.filter((o: any) => o.status === 'Delivered').length,
        todayOrders:     todayCount,
        onlineRevenue:   mappedOrders.filter((o: any) => o.payment_mode !== 'COD' && o.payment_status === 'paid')
                           .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/check-auth');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        fetchAll();
      }
    } catch (err) {
      console.error('Check auth error:', err);
    }
  }, [fetchAll]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchAll();
      } else {
        alert(data.error || 'Incorrect Password');
      }
    } catch {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch {
      alert('Logout failed');
    }
  };



  const updateStatus = async (orderId: string, status: string, extras?: Record<string, string>) => {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/admin/order-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, ...extras }),
      });
      await fetchAll();
      if (selectedOrder?.id === orderId) {
        const res = await fetch(`/api/admin/orders`);
        const data = await res.json();
        const updated = data.orders?.find((o: any) => o.order?.id === orderId);
        if (updated) setSelectedOrder({ ...updated.order, items: updated.items, tracking: updated.tracking });
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (newStatus === order.order_status) return;
    if (newStatus === 'shipped') {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      setDeliveryPartner('');
      setTrackingNum('');
      setExpectedDate(futureDate.toLocaleDateString('en-IN'));
      setShipModal({ orderId: order.id, status: newStatus });
    } else {
      await updateStatus(order.id, newStatus);
    }
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipModal) return;
    await updateStatus(shipModal.orderId, shipModal.status, {
      delivery_partner: deliveryPartner || 'Standard Delivery',
      tracking_number: trackingNum,
      expected_delivery_date: expectedDate,
    });
    setShipModal(null);
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.order_status === filterStatus;
    const matchSearch = !search || 
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.phone || '').includes(search) ||
      (o.email || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Email', 'City', 'Total', 'Payment Mode', 'Payment Status', 'Order Status'];
    const rows = filteredOrders.map(o => [
      o.id, new Date(o.created_at).toLocaleDateString('en-IN'), o.customer_name, o.phone, o.email, o.city,
      o.total, o.payment_mode, o.payment_status, o.order_status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `desiswad-orders-${Date.now()}.csv`; a.click();
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', color: '#1E5B3A', fontWeight: 800, marginBottom: 8 }}>DesiSwad Admin</h1>
          <p style={{ color: '#888', marginBottom: 32, fontSize: '0.95rem' }}>Secure Control Panel</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#1E5B3A'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            <button type="submit" style={{ background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)', color: '#fff', padding: '14px', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              🔒 Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navbar */}
      <div style={{ background: '#1E5B3A', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.2rem' }}>DesiSwad Admin</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginLeft: 8 }}>Order Control Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <a href="/admin/returns" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none' }}>
            🔁 Returns
          </a>
          <button onClick={fetchAll} style={{ background: '#D4AF37', color: '#1E5B3A', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            🔄 Refresh
          </button>
          <button onClick={handleLogout} style={{ background: '#B22222', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {STAT_CARDS.map(card => (
              <div key={card.key} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: `1px solid ${card.bg}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: '2rem', background: card.bg, width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 800, color: card.color }}>
                    {card.prefix || ''}{typeof stats[card.key as keyof Stats] === 'number' && card.key === 'totalRevenue'
                      ? Math.round(stats[card.key as keyof Stats] as number).toLocaleString('en-IN')
                      : stats[card.key as keyof Stats]}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #f3e5f5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '2rem', background: '#f3e5f5', width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📅</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Orders</p>
                <p style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#7b1fa2' }}>{stats.todayOrders}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <input
            placeholder="🔍 Search Order ID, name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', padding: '10px 16px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 6, flex: '1 1 auto', flexWrap: 'wrap' }}>
            {['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  background: filterStatus === s ? '#1E5B3A' : '#f5f5f5',
                  color: filterStatus === s ? '#fff' : '#555',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'all' ? `All (${orders.length})` : `${STATUS_LABELS[s]} (${orders.filter(o => o.order_status === s).length})`}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} style={{ background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            📥 Export CSV
          </button>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#888', fontSize: '1rem' }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p style={{ color: '#888', fontSize: '1rem' }}>No orders found.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafb', borderBottom: '2px solid #e8ecf0' }}>
                    {['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#555', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const sc = STATUS_COLORS[o.order_status] || STATUS_COLORS.placed;
                    const isUpdating = updatingId === o.id;
                    const currentIdx = STATUS_FLOW.indexOf(o.order_status);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      >
                        {/* Order ID + Date */}
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => setSelectedOrder(o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                            <p style={{ margin: 0, fontWeight: 800, color: '#B22222', fontFamily: 'monospace', fontSize: '0.95rem' }}>{o.id}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>
                              {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#bbb' }}>
                              {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </button>
                        </td>
                        {/* Customer */}
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#222' }}>{o.customer_name || 'N/A'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#888' }}>{o.phone}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#aaa' }}>{o.city}, {o.state}</p>
                        </td>
                        {/* Items */}
                        <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                          {o.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} style={{ margin: '0 0 2px', fontSize: '0.8rem', color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              • {item.name} {item.weight} x{item.qty}
                            </p>
                          ))}
                          {(o.items?.length || 0) > 2 && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>+{(o.items?.length || 0) - 2} more</p>
                          )}
                        </td>
                        {/* Amount */}
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ margin: 0, fontWeight: 800, color: '#1E5B3A', fontSize: '1rem' }}>₹{o.total}</p>
                        </td>
                        {/* Payment */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, background: o.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: o.payment_status === 'paid' ? '#2e7d32' : '#e65100' }}>
                            {o.payment_status === 'paid' ? '✔ PAID' : 'PENDING'}
                          </span>
                          <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#888' }}>{o.payment_mode}</p>
                        </td>
                        {/* Status Dropdown */}
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={o.order_status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(o, e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: 8, border: `2px solid ${sc.border}`,
                              background: sc.bg, color: sc.text, fontWeight: 700, cursor: 'pointer',
                              fontSize: '0.8rem', outline: 'none', transition: 'all 0.2s',
                            }}
                          >
                            {STATUS_FLOW.map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {isUpdating && <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#888' }}>Updating...</p>}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <button
                              onClick={() => setSelectedOrder(o)}
                              style={{ padding: '6px 12px', border: '1px solid #1E5B3A', borderRadius: 6, background: '#fff', color: '#1E5B3A', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
                            >
                              📋 Details
                            </button>
                            <a
                              href={`https://wa.me/${o.phone?.replace(/\D/g, '') || WHATSAPP_NUM}?text=Hi ${encodeURIComponent(o.customer_name || 'Customer')}! 👋 This is DesiSwad Foods. Your order *${o.id}* status: *${STATUS_LABELS[o.order_status]}*. Track: http://localhost:3000/track?id=${o.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: '6px 12px', border: 'none', borderRadius: 6, background: '#25D366', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center', display: 'block' }}
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 700, margin: 'auto', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1E5B3A, #2d7a4f)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Details</p>
                <h2 style={{ margin: '4px 0 0', color: '#D4AF37', fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800 }}>{selectedOrder.id}</h2>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                  {new Date(selectedOrder.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Customer + Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Customer */}
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Customer</p>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#111' }}>{selectedOrder.customer_name}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: '#666' }}>📞 {selectedOrder.phone}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>✉️ {selectedOrder.email}</p>
                </div>
                {/* Status + Payment */}
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💳 Payment</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, background: selectedOrder.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: selectedOrder.payment_status === 'paid' ? '#2e7d32' : '#e65100' }}>
                      {selectedOrder.payment_status === 'paid' ? '✔ PAID' : 'PENDING'}
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, background: '#f5f5f5', color: '#555' }}>
                      {selectedOrder.payment_mode}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E5B3A' }}>₹{selectedOrder.total}</p>
                  {(selectedOrder.subtotal !== undefined) && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#999' }}>
                      Subtotal ₹{selectedOrder.subtotal} + Shipping ₹{selectedOrder.shipping} {selectedOrder.cod_charge ? `+ COD ₹${selectedOrder.cod_charge}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Delivery Address</p>
                <p style={{ margin: 0, color: '#444', lineHeight: 1.6 }}>
                  {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}, {selectedOrder.country}
                </p>
                {selectedOrder.delivery_partner && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#1E5B3A' }}>
                    🚚 <strong>{selectedOrder.delivery_partner}</strong> — Tracking: <strong>{selectedOrder.tracking_number || 'N/A'}</strong>
                  </p>
                )}
                {selectedOrder.expected_delivery_date && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#555' }}>📅 Expected: {selectedOrder.expected_delivery_date}</p>
                )}
              </div>

              {/* Items */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🛒 Order Items</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < (selectedOrder.items?.length || 0) - 1 ? '1px solid #eee' : 'none' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#222' }}>{item.name}</span>
                      <span style={{ color: '#888', fontSize: '0.85rem' }}> — {item.weight} × {item.qty}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#B22222' }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Status Timeline */}
              {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Status Timeline</p>
                  {selectedOrder.tracking.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < (selectedOrder.tracking?.length || 0) - 1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === (selectedOrder.tracking?.length || 0) - 1 ? '#1E5B3A' : '#D4AF37', flexShrink: 0, marginTop: 4 }} />
                        {i < (selectedOrder.tracking?.length || 0) - 1 && <div style={{ width: 2, flex: 1, background: '#ddd', marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingBottom: 12 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#222', fontSize: '0.875rem' }}>{STATUS_LABELS[t.status] || t.status}</p>
                        <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#666' }}>{t.message}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>{new Date(t.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notifications Log */}
              {selectedOrder.notifications && selectedOrder.notifications.length > 0 && (
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#333', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📧 Email Log</p>
                  {selectedOrder.notifications.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, fontSize: '0.8rem' }}>
                      <span>{n.status === 'sent' ? '✅' : '❌'}</span>
                      <span style={{ flex: 1, color: '#444' }}>{n.subject}</span>
                      <span style={{ color: '#aaa', fontSize: '0.72rem' }}>{new Date(n.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href={`/track?id=${selectedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, textAlign: 'center', padding: '12px 16px', background: '#1E5B3A', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  📦 View Tracking Page
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.phone?.replace(/\D/g, '') || WHATSAPP_NUM}?text=Hi ${encodeURIComponent(selectedOrder.customer_name || 'Customer')}! 👋 DesiSwad Foods here. Your order *${selectedOrder.id}* is currently *${STATUS_LABELS[selectedOrder.order_status]}*. Track your order: http://localhost:3000/track?id=${selectedOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, textAlign: 'center', padding: '12px 16px', background: '#25D366', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  💬 WhatsApp Customer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ship Modal */}
      {shipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E5B3A', marginBottom: 24 }}>🚚 Shipping Details</h2>
            <form onSubmit={handleShipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#555', marginBottom: 6 }}>Delivery Partner *</label>
                <input value={deliveryPartner} onChange={e => setDeliveryPartner(e.target.value)} placeholder="e.g. BlueDart, Amazon, Delhivery" required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#555', marginBottom: 6 }}>Tracking ID (Optional)</label>
                <input value={trackingNum} onChange={e => setTrackingNum(e.target.value)} placeholder="e.g. BD1234567890"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#555', marginBottom: 6 }}>Expected Delivery Date</label>
                <input value={expectedDate} onChange={e => setExpectedDate(e.target.value)} placeholder="e.g. 15 Apr 2024"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShipModal(null)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', color: '#555', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 8, background: '#1E5B3A', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  🚚 Mark as Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
