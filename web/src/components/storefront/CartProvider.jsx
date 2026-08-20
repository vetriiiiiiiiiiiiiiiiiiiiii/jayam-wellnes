'use client';

import { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(undefined);
export function CartProvider({
  children
}) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('miracletree_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('miracletree_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);
  const addToCart = item => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {
          ...i,
          quantity: i.quantity + (item.quantity || 1)
        } : i);
      }
      return [...prev, {
        ...item,
        quantity: item.quantity || 1
      }];
    });
  };
  const removeFromCart = id => {
    setCart(prev => prev.filter(i => i.id !== id));
  };
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? {
      ...i,
      quantity
    } : i));
  };
  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  return <CartContext.Provider value={{
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,

    cartTotal
  }}>
      {children}
    </CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}