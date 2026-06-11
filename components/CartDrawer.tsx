'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count, clearCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const subtotal = total();
  const shipping = subtotal >= 499 ? 0 : subtotal > 0 ? 60 : 0;
  const grand = subtotal + shipping;

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeCart();
    if (isLoggedIn()) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) closeCart();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div className={`cart-backdrop${isOpen ? ' cart-backdrop--open' : ''}`} onClick={closeCart} />

      {/* Drawer */}
      <div ref={drawerRef} className={`cart-drawer${isOpen ? ' cart-drawer--open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header__title">
            <span>🛒</span>
            <span>Your Cart</span>
            {count() > 0 && <span className="cart-count-badge">{count()}</span>}
          </div>
          <button className="cart-close" onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__icon">🛍️</span>
              <p className="cart-empty__title">Your cart is empty</p>
              <p className="cart-empty__sub">Add some delicious snacks!</p>
              <button className="btn btn-primary btn-sm" onClick={closeCart}>
                <Link href="/shop" style={{color:'inherit'}}>Browse Snacks</Link>
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="cart-item">
                  <div className="cart-item__img">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill style={{objectFit:'cover'}} />
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__weight">{item.weight}</p>
                    <p className="cart-item__price">₹{item.price}</p>
                  </div>
                  <div className="cart-item__actions">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item__remove" onClick={() => removeItem(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="cart-summary__row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green' : ''}>
                  {shipping === 0 ? '🎉 FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="cart-free-ship">Add ₹{499 - subtotal} more for free shipping!</p>
              )}
              <div className="cart-summary__total">
                <span>Total</span>
                <span>₹{grand}</span>
              </div>
            </div>
            <button onClick={handleCheckoutClick} className="btn btn-primary" style={{width:'100%',justifyContent:'center', border: 'none'}}>
              Proceed to Checkout →
            </button>
            <button className="cart-clear" onClick={clearCart}>Clear Cart</button>
          </div>
        )}
      </div>

      
    </>
  );
}
