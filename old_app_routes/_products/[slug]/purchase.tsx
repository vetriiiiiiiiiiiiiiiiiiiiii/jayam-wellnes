'use client';

import { useState } from 'react';
import { products } from '@/lib/catalog';
import { useCommerce } from '@/components/commerce-provider';

export default function ProductPurchase({ product, price }: { product: string; price: number }) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { add } = useCommerce();
  const item = products.find((candidate) => candidate.name === product);
  return <div className="purchase"><div className="quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button><span>0{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button></div><button className="purchase-button" onClick={() => { if (item) add(item, quantity); setAdded(true); }}>{added ? `${product} added` : `Add to bag · ₹${price}`} <span>→</span></button></div>;
}
