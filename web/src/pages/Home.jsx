import { useEffect, useState } from 'react';
import axios from 'axios';
import WellnessHero from '../components/home/WellnessHero';
import PromiseStrip from '../components/home/PromiseStrip';
import ShopByNeed from '../components/home/ShopByNeed';
import DailyRitual from '../components/home/DailyRitual';
import MadeWithCare from '../components/home/MadeWithCare';
import ClosingInvite from '../components/home/ClosingInvite';
import useScrollReveal from '../lib/useScrollReveal';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        if (Array.isArray(response.data)) setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };
    fetchProducts();
  }, []);

  useScrollReveal([products.length]);

  return (
    <div className="wl-home">
      <WellnessHero products={products} />
      <PromiseStrip />
      <ShopByNeed products={products} />
      <DailyRitual />
      <MadeWithCare />
      <ClosingInvite />
    </div>
  );
}

export default Home;
