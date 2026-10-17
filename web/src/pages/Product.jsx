import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductGallery from '../components/storefront/ProductGallery';
import ProductActions from '../components/storefront/ProductActions';
import ReviewSection from '../components/storefront/ReviewSection';
import { CATEGORY_LABELS, FREE_SHIPPING_THRESHOLD, formatPrice } from '../lib/store';

// Required alongside structure/function statements on U.S. dietary supplements
// Quick-glance trust points, taken from the product information Jayam supplied
const TRUST_POINTS = {
  SUPPLEMENT: ['Vegan', 'Non-GMO', 'No fillers or binders', 'GMP-certified', 'Third-party tested'],
  SKINCARE: ['100% natural oils', 'Cruelty-free', 'No artificial fragrance', 'All skin types'],
};

const FDA_STATEMENT = '*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${slug}`);
        setProduct(response.data);
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } catch (error) {
        if (error.response?.status === 404) navigate('/shop');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="bg-brand-pearl min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-brand-dark/40 font-serif text-2xl">Loading...</div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="jayam-product-page min-h-screen text-brand-dark font-sans">
      {/* HERO SECTION */}
      <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Left: Image Gallery */}
          <div className="lg:w-3/5">
            <ProductGallery images={product.images} product={product} />
          </div>

          {/* Right: Details */}
          <div className="lg:w-2/5 relative">
            <div className="sticky top-40 flex flex-col pt-12 pb-32">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-brand-forest-700/70">
                {product.category || CATEGORY_LABELS[product.productType] || 'Wellness'}
              </p>
              <h1 className="text-4xl md:text-6xl font-serif tracking-tighter leading-none mb-4">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="font-serif italic text-2xl text-brand-forest-700 mb-6">{product.tagline}</p>
              )}

              <div className="font-mono text-xl mb-6">
                {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                {((selectedVariant && selectedVariant.compareAtPrice > selectedVariant.price) || (!selectedVariant && product.compareAtPrice > product.price)) && (
                  <span className="text-sm text-gray-400 line-through ml-3">
                    {formatPrice(selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <div className="text-base text-gray-600 mb-8 leading-relaxed font-normal">
                  {product.shortDescription}
                </div>
              )}
              {TRUST_POINTS[product.productType] && (
                <ul className="jayam-trust-points" aria-label="Product qualities">
                  {TRUST_POINTS[product.productType].map((point) => <li key={point}>{point}</li>)}
                </ul>
              )}
              {product.variants?.length > 0 && (
                <p className="mb-5 text-xs uppercase tracking-widest text-gray-500">
                  {selectedVariant?.stock > 0 ? `${selectedVariant.stock} available` : 'Currently unavailable'}
                </p>
              )}

              {product.productType === 'BUNDLE' && product.relatedTo && product.relatedTo.length > 0 && (
                <div className="mb-12 border-y border-gray-200 py-8">
                  <h3 className="text-sm uppercase tracking-widest font-medium text-brand-forest-700 mb-6">What's included</h3>
                  <div className="space-y-4">
                    {product.relatedTo.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.relatedProduct?.images?.[0] && (
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            <img src={item.relatedProduct.images[0].url} alt={item.relatedProduct.name} className="object-cover w-full h-full" />
                          </div>
                        )}
                        <p className="font-medium text-lg">{item.relatedProduct?.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ProductActions 
                product={product} 
                selectedVariant={selectedVariant}
                onVariantSelect={setSelectedVariant}
              />
              <p className="mt-6 text-xs uppercase tracking-widest text-gray-500">
                Free U.S. shipping on orders ${FREE_SHIPPING_THRESHOLD}+ · Ships in 2–7 business days
              </p>
              
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS / FULL-DESCRIPTION SECTION */}
      {(product.description || product.highlights?.length > 0) && (
        <section className="py-24 px-6 border-t border-gray-200">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-brand-dark mb-10 tracking-tighter text-center">Product details</h2>
            {product.description && (
              <div className="space-y-6 leading-relaxed text-gray-700 font-light text-lg md:text-xl">
                {product.description.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
            )}
            {product.highlights?.length > 0 && (
              <ul className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2">
                {product.highlights.map(({ title, body }) => (
                  <li key={title} className="border-t border-gray-200 pt-5">
                    <h3 className="mb-2 text-sm uppercase tracking-[0.15em] font-semibold text-brand-forest-700">{title}</h3>
                    <p className="text-gray-700 leading-relaxed">{body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* INGREDIENTS SECTION */}
      {product.ingredients && (
        <section className="py-24 px-6 border-t border-gray-200">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] mb-4 text-brand-forest-700 font-semibold">The formula</h2>
              <h3 className="text-3xl md:text-5xl font-serif leading-tight">Pure ingredients, <span className="italic text-brand-green-500">nothing hidden.</span></h3>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light md:pt-10">
              {product.ingredients}
            </p>
          </div>
        </section>
      )}

      {/* HOW TO USE & SPECS SECTION */}
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            {product.usageInstructions && (
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] mb-8 text-brand-forest-700 font-semibold border-b border-gray-200 pb-4">How to Use</h2>
                <p className="text-xl text-gray-700 leading-relaxed font-light">{product.usageInstructions}</p>
              </div>
            )}

            {product.specs && product.specs.length > 0 && (
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] mb-8 text-brand-forest-700 font-semibold border-b border-gray-200 pb-4">Specifications</h2>
                <div className="space-y-4">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 uppercase tracking-wider">{spec.name}</span>
                      <span className="text-lg text-gray-900 font-medium mt-1 sm:mt-0">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SAFETY & DISCLAIMERS */}
      {(product.warnings || product.disclaimer) && (
        <section className="py-16 px-6 border-t border-gray-200">
          <div className="max-w-[900px] mx-auto grid gap-10 md:grid-cols-2 text-sm leading-relaxed text-gray-600">
            {product.warnings && (
              <div>
                <h2 className="mb-3 text-xs uppercase tracking-[0.2em] font-semibold text-brand-forest-700">Warnings &amp; precautions</h2>
                <p>{product.warnings}</p>
              </div>
            )}
            <div>
              <h2 className="mb-3 text-xs uppercase tracking-[0.2em] font-semibold text-brand-forest-700">Please note</h2>
              {product.productType === 'SUPPLEMENT' && <p className="mb-3">{FDA_STATEMENT}</p>}
              {product.disclaimer && <p>{product.disclaimer}</p>}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 tracking-tighter">Customer Reviews</h2>
          <ReviewSection productId={product.id} reviews={product.reviews || []} />
        </div>
      </section>
    </div>
  );
}
