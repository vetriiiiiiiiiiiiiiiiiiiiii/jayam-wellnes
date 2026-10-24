import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, Truck } from 'lucide-react';
import ProductGallery from '../components/storefront/ProductGallery';
import ProductActions from '../components/storefront/ProductActions';
import ProductCard from '../components/storefront/ProductCard';
import ReviewSection from '../components/storefront/ReviewSection';
import ProductSubnav from '../components/storefront/ProductSubnav';
import ProductHero from '../components/storefront/ProductHero';
import ProductStory from '../components/storefront/ProductStory';
import { useCart } from '../components/storefront/CartProvider';
import { useSiteContent } from '../lib/content';
import { CATEGORY_LABELS, FREE_SHIPPING_THRESHOLD, formatPrice } from '../lib/store';
import useScrollReveal from '../lib/useScrollReveal';

// Quick-glance trust points, taken from the product information Jayam supplied
const TRUST_POINTS = {
  SUPPLEMENT: ['Vegan', 'Non-GMO', 'No fillers or binders', 'GMP-certified', 'Third-party tested'],
  SKINCARE: ['100% natural oils', 'Cruelty-free', 'No artificial fragrance', 'All skin types'],
};

// Required alongside structure/function statements on U.S. dietary supplements
const FDA_STATEMENT = '*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

// Highlight tiles cycle through the client palette
const TONES = ['fern', 'wheat', 'earth', 'cherry', 'hay', 'surface'];

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const stories = useSiteContent('product-stories');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${slug}`);
        setProduct(response.data);
        setSelectedVariant(response.data.variants?.[0] || null);
      } catch (error) {
        if (error.response?.status === 404) navigate('/shop');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(({ data }) => Array.isArray(data) && setOthers(data.filter((item) => item.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  useScrollReveal([product?.id, others.length, stories]);

  if (loading) {
    return <main className="pg pp-loading" aria-busy="true"><p className="pg-note">Loading…</p></main>;
  }

  if (!product) return null;

  const price = selectedVariant ? selectedVariant.price : product.price;
  const compareAt = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const category = product.category || CATEGORY_LABELS[product.productType] || 'Wellness';
  const specs = product.specs || [];

  const buy = () => {
    addToCart({
      id: selectedVariant ? `${product.id}:${selectedVariant.sku || selectedVariant.name}` : product.id,
      productId: product.id,
      variantSku: selectedVariant?.sku,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price,
      quantity: 1,
      image: product.images?.[0]?.url,
    });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  const shortTitle = product.name.replace(/^Organic\s+/i, '').split(' — ')[0];
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'specs', label: 'Specs' },
    { id: 'buy', label: 'Buy' },
    { id: 'reviews', label: 'Reviews' },
  ];

  // realme-style product page: sticky product bar → big opening screen → the story →
  // feature grid → specs → buy → reviews → more products
  return (
    <main className="pg pp pp--story">
      <ProductSubnav name={shortTitle} price={price} sections={sections} />
      <ProductHero product={product} name={shortTitle} category={category} points={TRUST_POINTS[product.productType] || []} />

      <div id="features" className="pp-features">
      {stories[product.slug] ? (
        <ProductStory product={product} story={stories[product.slug]} description={product.description} onBuy={buy} />
      ) : product.description && (
        <section className="pp-overview" data-reveal>
          <p className="pg-eyebrow">Overview</p>
          <h2>{product.tagline || product.name}</h2>
          {product.description.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
      )}

      {product.highlights?.length > 0 && (
        <section className="pp-highlights pp-bento" aria-labelledby="pp-highlights-title">
          <h2 id="pp-highlights-title" className="pg-section-title">The details <em>that matter.</em></h2>
          <div className="pp-highlight-grid">
            {product.highlights.map(({ title, body }, index) => (
              <article key={title} className={`pp-highlight pp-highlight--${TONES[index % TONES.length]}`} data-reveal>
                <span className="pp-highlight-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="pp-details" id="specs" aria-label="Ingredients, use and specifications">
        {product.ingredients && (
          <article className="pg-tile" data-reveal>
            <p className="pg-eyebrow">The formula</p>
            <h2>Ingredients</h2>
            <p>{product.ingredients}</p>
          </article>
        )}
        {product.usageInstructions && (
          <article className="pg-tile" data-reveal>
            <p className="pg-eyebrow">Daily ritual</p>
            <h2>How to use</h2>
            <p>{product.usageInstructions}</p>
          </article>
        )}
        {specs.length > 0 && (
          <article className="pg-tile pp-specs" data-reveal>
            <p className="pg-eyebrow">At a glance</p>
            <h2>Specifications</h2>
            <dl>
              {specs.map((spec) => (
                <div key={spec.name}>
                  <dt>{spec.name}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        )}
      </section>

      </div>

      <section className="pp-buyzone" id="buy" aria-labelledby="pp-buyzone-title">
        <h2 id="pp-buyzone-title" className="pg-section-title">Make it <em>yours.</em></h2>
      <section className="pp-top">
        <div className="pp-stage">
          <ProductGallery images={product.images} product={product} />
        </div>

        <div className="pp-buy">
          <p className="pg-eyebrow">{category}</p>
          <h2 className="pp-buy-title">{product.name}</h2>
          {product.tagline && <p className="pp-tagline">{product.tagline}</p>}
          <p className="pp-price">
            {formatPrice(price)}
            {compareAt > price && <s>{formatPrice(compareAt)}</s>}
          </p>
          {product.shortDescription && <p className="pp-short">{product.shortDescription}</p>}

          {TRUST_POINTS[product.productType] && (
            <ul className="pp-trust" aria-label="Product qualities">
              {TRUST_POINTS[product.productType].map((point) => <li key={point}>{point}</li>)}
            </ul>
          )}

          {product.productType === 'BUNDLE' && product.relatedTo?.length > 0 && (
            <div className="pp-bundle">
              <h2>What’s included</h2>
              <ul>
                {product.relatedTo.map((item) => <li key={item.id}>{item.relatedProduct?.name}</li>)}
              </ul>
            </div>
          )}

          {product.variants?.length > 0 && (
            <p className="pg-note">{selectedVariant?.stock > 0 ? `${selectedVariant.stock} available` : 'Currently unavailable'}</p>
          )}

          <ProductActions product={product} selectedVariant={selectedVariant} onVariantSelect={setSelectedVariant} />

          <ul className="pp-service">
            <li>
              <Truck size={20} strokeWidth={1.6} aria-hidden="true" />
              <span><b>Free U.S. shipping</b> on orders ${FREE_SHIPPING_THRESHOLD}+. Ships in 2–7 business days.</span>
            </li>
            <li>
              <MessageCircle size={20} strokeWidth={1.6} aria-hidden="true" />
              <span><b>Questions?</b> <Link to="/contact?category=PRODUCT_QUESTION">Ask us</Link> — we reply within 1 business day.</span>
            </li>
          </ul>
        </div>
      </section>
      </section>

      {(product.warnings || product.disclaimer || product.productType === 'SUPPLEMENT') && (
        <section className="pp-fineprint">
          {product.warnings && <p><b>Warnings &amp; precautions.</b> {product.warnings}</p>}
          {product.productType === 'SUPPLEMENT' && <p>{FDA_STATEMENT}</p>}
          {product.disclaimer && <p>{product.disclaimer}</p>}
        </section>
      )}

      <section className="pp-reviews" id="reviews" aria-labelledby="pp-reviews-title">
        <h2 id="pp-reviews-title" className="pg-section-title">What people <em>are saying.</em></h2>
        <ReviewSection key={product.id} productId={product.id} reviews={product.reviews || []} />
      </section>

      {others.length > 0 && (
        <section className="pp-more" aria-labelledby="pp-more-title">
          <h2 id="pp-more-title" className="pg-section-title">Complete your <em>ritual.</em></h2>
          <div className="sh-grid sh-grid--thirds">
            {others.map((item) => <ProductCard key={item.id} product={item} size="compact" />)}
          </div>
        </section>
      )}
    </main>
  );
}
