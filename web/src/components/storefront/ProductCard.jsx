'use client';

import { Link } from 'react-router-dom';

import { useState } from 'react';
import MagneticButton from './MagneticButton';
import { useCart } from './CartProvider';
export default function ProductCard({
  product,
  index
}) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    addToCart
  } = useCart();

  // Use actual images from DB, fallback to Unsplash placeholders if none exist
  const defaultImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1615396899839-c99c14188f00?w=800";
  const hoverImage = product.images?.[1]?.url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2800&auto=format&fit=crop";
  return <div className="group relative flex flex-col w-full h-[60vh] md:h-[500px]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link to={`/products/${product.slug}`} className="relative flex-1 overflow-hidden rounded-2xl bg-gray-100 block">
        {/* Primary Image */}
        <img src={defaultImage} alt={product.name} sizes="(max-width: 768px) 80vw, 400px" className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] ${isHovered ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`} />
        
        {/* Alternate Image on Hover */}
        <img src={hoverImage} alt={`${product.name} lifestyle`} sizes="(max-width: 768px) 80vw, 400px" className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] ${isHovered ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`} />
        
        {/* Dark gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Link>

      {/* Floating Apple-style Pill Add to Cart */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] delay-100">
        <MagneticButton>
          <button onClick={e => {
          e.preventDefault();
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: defaultImage
          });
        }} className="px-8 py-3 bg-white/90 backdrop-blur-md rounded-full text-black text-xs uppercase tracking-[0.2em] font-medium shadow-2xl pointer-events-auto hover:bg-black hover:text-white transition-colors duration-300">
            Quick Add
          </button>
        </MagneticButton>
      </div>

      <div className="flex flex-col mt-6">
        <h3 className="text-xl font-serif text-brand-dark group-hover:text-brand-green-700 transition-colors tracking-tight">{product.name}</h3>
        <p className="text-gray-500 mt-2 font-mono text-sm">₹{product.price}</p>
      </div>
    </div>;
}