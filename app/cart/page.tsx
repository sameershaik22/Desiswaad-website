'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateQty, removeItem, total, count } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn()) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Your Cart</h1>
        <p>Your cart is empty</p>
        <Link href="/shop" className="btn btn--primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Cart ({count()} items)</h1>

      <div className="cart">
        <div className="cart__items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__image">
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="cart-item__info">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <p>₹{item.price}</p>
              </div>
              <div className="cart-item__quantity">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item__total">
                ₹{item.price * item.quantity}
              </div>
              <button
                className="cart-item__remove"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart__summary">
          <h3>Order Summary</h3>
          <p>Total: ₹{total()}</p>
          <button onClick={handleCheckoutClick} className="btn btn--primary" style={{ border: 'none', width: '100%' }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}