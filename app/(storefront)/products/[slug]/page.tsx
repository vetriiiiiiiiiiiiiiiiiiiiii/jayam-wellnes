import db from "@/lib/db";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/storefront/ProductGallery";
import ProductActions from "@/components/storefront/ProductActions";
import ReviewSection from "@/components/storefront/ReviewSection";

export default async function ProductPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { 
      images: true, 
      reviews: { orderBy: { createdAt: 'desc' } },
      relatedTo: {
        where: { type: 'BUNDLE_ITEM' },
        include: {
          relatedProduct: {
            include: { images: true }
          }
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-brand-pearl min-h-screen pt-24 text-brand-dark">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          {/* Left: Huge Sticky Image Gallery */}
          <div className="lg:w-3/5">
             <ProductGallery images={product.images} />
          </div>

          {/* Right: Sticky Details */}
          <div className="lg:w-2/5 relative">
            <div className="sticky top-40 flex flex-col pt-12 pb-32">
              <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-none mb-6">
                {product.name}
              </h1>
              
              <div className="font-mono text-xl mb-12">
                ₹{product.price}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through ml-3">₹{product.compareAtPrice}</span>
                )}
              </div>
              
              <div className="prose prose-lg prose-green mb-10 leading-relaxed text-gray-700">
                {product.description || "Potent by nature, crafted for your daily ritual. Discover the peak of wellness."}
              </div>

              {/* Bundle Included Items */}
              {product.productType === 'BUNDLE' && product.relatedTo && product.relatedTo.length > 0 && (
                <div className="mb-12 border-y border-gray-200 py-8">
                  <h3 className="text-sm uppercase tracking-widest font-medium text-brand-forest-700 mb-6">What's included</h3>
                  <div className="space-y-4">
                    {product.relatedTo.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        {item.relatedProduct.images[0] && (
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden relative">
                            <img src={item.relatedProduct.images[0].url} alt={item.relatedProduct.name} className="object-cover w-full h-full" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-lg">{item.relatedProduct.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ProductActions product={product} />
              
              <ReviewSection productId={product.id} reviews={product.reviews || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
