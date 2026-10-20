import { useEffect, useState } from 'react';
import axios from 'axios';
import JayamHero from '../components/home/JayamHero';
import ProductTiles from '../components/home/ProductTiles';
import WhyJayam from '../components/home/WhyJayam';
import PlantToPack from '../components/home/PlantToPack';
import StoryTeaser from '../components/home/StoryTeaser';
import FinalCta from '../components/home/FinalCta';
import useScrollReveal from '../lib/useScrollReveal';

// Home flow (apple.com rhythm): hero → product tiles → highlights → plant to pack → our story → call to action
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
    <div className="jhome">
      <JayamHero products={products} />
      <ProductTiles products={products} />
      <WhyJayam />
      <PlantToPack />
      <StoryTeaser />
      <FinalCta />
    </div>
  );
}

export default Home;
