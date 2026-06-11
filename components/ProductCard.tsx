'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

interface Product {
  id: number;
  name: string;
  slug?: string;
  tagline?: string;
  price?: number;
  prices?: Record<string, number>;
  stock?: number;
  image: string | null;
  category: string | null;
  description: string | null;
  created_at?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const weights = product.prices ? Object.keys(product.prices) : [];
  const [selectedWeight, setSelectedWeight] = useState(weights.length > 0 ? weights[0] : undefined);
  
  const currentPrice = product.prices && selectedWeight 
    ? product.prices[selectedWeight] 
    : (product.price ?? 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click if added via button
    
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: currentPrice,
      weight: selectedWeight,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pcard" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image */}
      <Link href={`/shop/${product.slug || product.id}`} className="pcard__img-wrap">
        <Image src={product.image || '/placeholder.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} />
        <div className="pcard__overlay">
          <span>View Details →</span>
        </div>
      </Link>

      {/* Body */}
      <div className="pcard__body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="pcard__meta">
          <span className="pcard__category">{product.category}</span>
          <span className="pcard__stock">
            {(product.stock ?? 100) > 0 ? (
              <span style={{ fontSize: '0.72rem', color: '#1E5B3A', fontWeight: 600 }}>In Stock</span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: '#B22222', fontWeight: 600 }}>Out of Stock</span>
            )}
          </span>
        </div>

        <h3 className="pcard__name">
          <Link href={`/shop/${product.slug || product.id}`}>{product.name}</Link>
        </h3>
        
        {product.tagline && (
          <p className="pcard__tagline" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', marginBottom: '8px', lineHeight: 1.4 }}>
            {product.tagline}
          </p>
        )}

        {/* Weights selector */}
        {weights.length > 0 && (
          <div className="pcard__weights" style={{ marginTop: '10px' }}>
            {weights.map((w) => (
              <button
                key={w}
                className={`pcard__weight-btn ${selectedWeight === w ? 'pcard__weight-btn--active' : ''}`}
                onClick={(e) => { e.preventDefault(); setSelectedWeight(w); }}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        <div className="pcard__footer" style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <div className="pcard__price">
            <span className="pcard__price-symbol">₹</span>
            <span className="pcard__price-val">
              {currentPrice}
            </span>
          </div>

          <button
            className={`pcard__add-btn ${added ? 'pcard__add-btn--added' : ''}`}
            onClick={handleAddToCart}
            disabled={(product.stock ?? 100) === 0}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
