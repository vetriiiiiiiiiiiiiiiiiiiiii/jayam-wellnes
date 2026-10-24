import { useEffect, useState } from 'react';
import axios from 'axios';
import JayamHero from '../components/home/JayamHero';
import ProductShowcase from '../components/home/ProductShowcase';
import WhyJayam from '../components/home/WhyJayam';
import PlantToPack from '../components/home/PlantToPack';
import StoryTeaser from '../components/home/StoryTeaser';
import FinalCta from '../components/home/FinalCta';
import useScrollReveal from '../lib/useScrollReveal';
import { useSiteContent } from '../lib/content';

// Home flow: hero with the Jayam seal → product showcase → highlights → plant to pack → our story → call to action.
// All text comes from Admin → Site content, falling back to the defaults in lib/content.js.
function Home() {
  const [products, setProducts] = useState([]);
  const content = useSiteContent('home');

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
      <JayamHero products={products} content={content.hero} />
      <ProductShowcase products={products} content={content.showcase} />
      <WhyJayam content={content.why} />
      <PlantToPack content={content.plant} />
      <StoryTeaser content={content.story} />
      <FinalCta content={content.final} />
    </div>
  );
}

export default Home;
