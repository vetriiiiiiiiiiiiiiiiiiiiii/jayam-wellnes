'use client';

import { useCart } from './CartProvider';

export default function QuickAddButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the product page
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1615397323171-897dbb25dfdd?q=80&w=2940&auto=format&fit=crop',
    });
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-10">
      <button 
        onClick={handleQuickAdd}
        className="w-full bg-brand-forest-700/90 backdrop-blur-md text-brand-pearl py-4 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-brand-forest-700 transition-colors"
      >
        Quick Add
      </button>
    </div>
  );
}
