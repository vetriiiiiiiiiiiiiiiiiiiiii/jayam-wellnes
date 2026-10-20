import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductArt from './ProductArt';

// One shared request for the catalogue, so every bag or order line can draw its pack
let catalogue;
const loadCatalogue = () => {
  catalogue ||= axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
    .then(({ data }) => (Array.isArray(data) ? data : []))
    .catch(() => {
      catalogue = undefined;
      return [];
    });
  return catalogue;
};

// Small product picture for bag, checkout and order lines
export default function ItemThumb({ item, className = 'os-thumb' }) {
  const [product, setProduct] = useState(null);
  const productId = item.productId || String(item.id || '').split(':')[0];

  useEffect(() => {
    if (item.image) return undefined;
    let active = true;
    loadCatalogue().then((products) => {
      if (active) setProduct(products.find((entry) => entry.id === productId || entry.name === item.name) || null);
    });
    return () => { active = false; };
  }, [item.image, item.name, productId]);

  return (
    <span className={className}>
      {item.image ? <img src={item.image} alt="" /> : product ? <ProductArt product={product} /> : <img src="/jayam-logo.png" alt="" />}
    </span>
  );
}
