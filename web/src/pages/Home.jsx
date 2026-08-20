import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeroSection from '../components/storefront/HeroSection';
import HorizontalProducts from '../components/storefront/HorizontalProducts';
import ValuesSection from '../components/storefront/ValuesSection';
import TestimonialsCarousel from '../components/storefront/TestimonialsCarousel';
import TrustSection from '../components/storefront/TrustSection';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <HeroSection />
      <HorizontalProducts products={products} />
      <ValuesSection />
      <TestimonialsCarousel />
      <TrustSection />
    </div>
  );
}

export default Home;
