'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, authHeaders } from '@/lib/authStore';

interface Address {
  id: number;
  name: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Lakshadweep','Andaman and Nicobar Islands','Dadra and Nagar Haveli','Daman and Diu'];

export default function SavedAddressesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState({
    name: '',
    recipient_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: 'Telangana',
    pincode: '',
    country: 'India',
    is_default: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn()) {
      router.push('/login?redirect=/saved-addresses');
    }
  }, [isLoggedIn, mounted, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses', {
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load addresses');
      setAddresses(data.addresses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      fetchAddresses();
    }
  }, [isLoggedIn]);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      name: '',
      recipient_name: '',
      phone: '',
      address_line: '',
      city: '',
      state: 'Telangana',
      pincode: '',
      country: 'India',
      is_default: false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setForm({
      name: addr.name,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line: addr.address_line,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      is_default: addr.is_default,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(authHeaders() as any) },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');
      
      setModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: authHeaders() as any,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');
      fetchAddresses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      const res = await fetch(`/api/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(authHeaders() as any) },
        body: JSON.stringify({ ...addr, is_default: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update default address');
      fetchAddresses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏳</div>
          <p style={{ color: '#888' }}>Loading saved addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .addr-card { animation: fadeUp 0.35s ease both; background: #fff; border: 1.5px solid #eee; border-radius: 16px; padding: 24px; position: relative; transition: all 0.25s; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .addr-card:hover { border-color: #1E5B3A; box-shadow: 0 8px 24px rgba(30,91,58,0.08); }
        .addr-card.default { border-color: #1E5B3A; background: #fdfdfd; box-shadow: 0 8px 24px rgba(30,91,58,0.05); }
        .addr-input:focus { border-color:#1E5B3A !important; box-shadow:0 0 0 3px rgba(30,91,58,0.1); }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1E5B3A 0%, #2d7a4f 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 800, margin: '0 0 6px' }}>📍 Saved Addresses</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Manage your delivery addresses for seamless checkout</p>
          </div>
          <button onClick={openAddModal} style={{ padding: '12px 24px', background: '#D4AF37', color: '#1E5B3A', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(212,175,55,0.3)', transition: 'all 0.2s' }}>
            ➕ Add New Address
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 20px 80px' }}>
        {error && (
          <div style={{ background: '#fce4ec', borderRadius: 10, padding: '14px 18px', color: '#c62828', marginBottom: 24, fontWeight: 600 }}>❌ {error}</div>
        )}

        {addresses.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '2px dashed #ddd' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📍</div>
            <h3 style={{ color: '#333', fontWeight: 700, margin: '0 0 8px' }}>Your address book is empty</h3>
            <p style={{ color: '#888', margin: '0 0 24px' }}>Save your delivery addresses here to speed up checking out.</p>
            <button onClick={openAddModal} style={{ padding: '14px 28px', background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
              ➕ Add Your First Address
            </button>
          </div>
        )}

        {addresses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {addresses.map((addr, idx) => (
              <div key={addr.id} className={`addr-card ${addr.is_default ? 'default' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                {addr.is_default && (
                  <span style={{ position: 'absolute', top: 16, right: 16, background: '#e8f5e9', color: '#1E5B3A', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(30,91,58,0.2)' }}>
                    ⭐ Default
                  </span>
                )}
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#333' }}>{addr.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: '#1E5B3A' }}>{addr.recipient_name}</p>
                
                <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#555', lineHeight: 1.5 }}>{addr.address_line}</p>
                <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#555' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                
                <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#888' }}>📞 Phone: {addr.phone}</p>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={() => openEditModal(addr)} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#555' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} style={{ flex: 1, padding: '8px', background: '#fff', border: '1px solid #f8bbd0', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#c62828' }}>
                    🗑️ Delete
                  </button>
                </div>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr)} style={{ display: 'block', width: '100%', marginTop: 10, padding: '8px', background: 'none', border: '1.5px dashed #ccc', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#777', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E5B3A'; e.currentTarget.style.color = '#1E5B3A'; }}>
                    ⭐ Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, margin: 20, position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#aaa' }}>×</button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 20, fontWeight: 800, color: '#1E5B3A' }}>
              {editingAddress ? '✏️ Edit Saved Address' : '➕ Add New Address'}
            </h2>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Address Label *</label>
                <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required placeholder="e.g. Home, Office, Parents" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Recipient Name *</label>
                  <input value={form.recipient_name} onChange={e => setForm(prev => ({ ...prev, recipient_name: e.target.value }))} required placeholder="Who is it for?" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number *</label>
                  <input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} required placeholder="Contact number" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Street Address *</label>
                <input value={form.address_line} onChange={e => setForm(prev => ({ ...prev, address_line: e.target.value }))} required placeholder="Flat / House No, Street, Locality" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>City *</label>
                  <input value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} required placeholder="City" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Pincode *</label>
                  <input value={form.pincode} onChange={e => setForm(prev => ({ ...prev, pincode: e.target.value }))} required placeholder="Pincode" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>State *</label>
                  <select value={form.state} onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))} required className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Country *</label>
                  <input value={form.country} onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))} required placeholder="Country" className="addr-input" style={{ width: '100%', padding: '11px 12px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm(prev => ({ ...prev, is_default: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#1E5B3A', cursor: 'pointer' }} />
                <label htmlFor="is_default" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', cursor: 'pointer' }}>Set as default delivery address</label>
              </div>

              {formError && (
                <p style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: 16, fontWeight: 600 }}>❌ {formError}</p>
              )}

              <button type="submit" disabled={formLoading} style={{ width: '100%', padding: '14px', background: '#1E5B3A', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: formLoading ? 'not-allowed' : 'pointer' }}>
                {formLoading ? '⏳ Saving...' : '💾 Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
