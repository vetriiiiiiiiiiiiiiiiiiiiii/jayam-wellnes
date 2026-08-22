import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductGallery from '../components/storefront/ProductGallery';
import ProductActions from '../components/storefront/ProductActions';
import ReviewSection from '../components/storefront/ReviewSection';

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
    <div className="bg-brand-pearl min-h-screen text-brand-dark font-sans">
      {/* HERO SECTION */}
      <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Left: Image Gallery */}
          <div className="lg:w-3/5">
            <ProductGallery images={product.images} />
          </div>

          {/* Right: Details */}
          <div className="lg:w-2/5 relative">
            <div className="sticky top-40 flex flex-col pt-12 pb-32">
              <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none mb-6">
                {product.name}
              </h1>

              <div className="font-mono text-xl mb-6">
                ₹{selectedVariant ? selectedVariant.price : product.price}
                {((selectedVariant && selectedVariant.compareAtPrice > selectedVariant.price) || (!selectedVariant && product.compareAtPrice > product.price)) && (
                  <span className="text-sm text-gray-400 line-through ml-3">
                    ₹{selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <div className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                  {product.shortDescription}
                </div>
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
              
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS / FULL-DESCRIPTION SECTION */}
      {product.description && (
        <section className="bg-white py-24 px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-brand-dark mb-8 tracking-tighter">Why You'll Love It</h2>
            <div className="prose prose-lg prose-green mx-auto leading-relaxed text-gray-700 font-light text-xl">
              {product.description}
            </div>
          </div>
        </section>
      )}

      {/* INGREDIENTS SECTION */}
      {product.ingredients && (
        <section className="bg-brand-green-900 text-white py-24 px-6 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm uppercase tracking-[0.2em] mb-4 text-brand-green-300">The Formula</h2>
                <h3 className="text-4xl md:text-6xl font-serif mb-8 leading-tight text-white">Pure ingredients, <br/><span className="italic text-brand-green-200">nothing hidden.</span></h3>
              </div>
              <div>
                <p className="text-xl leading-relaxed text-brand-green-50 font-light">
                  {product.ingredients}
                </p>
              </div>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-green-800 rounded-full blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        </section>
      )}

      {/* HOW TO USE & SPECS SECTION */}
      <section className="bg-brand-pearl py-24 px-6">
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

      {/* REVIEWS SECTION */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 tracking-tighter">Customer Reviews</h2>
          <ReviewSection productId={product.id} reviews={product.reviews || []} />
        </div>
      </section>
    </div>
  );
}
