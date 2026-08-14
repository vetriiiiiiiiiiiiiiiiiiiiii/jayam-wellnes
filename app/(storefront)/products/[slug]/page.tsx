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
    include: { images: true, reviews: { orderBy: { createdAt: 'desc' } } }
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
              
              <div className="font-mono text-xl mb-12">₹{product.price}</div>
              
              <div className="prose prose-lg prose-green mb-16 leading-relaxed text-gray-700">
                {product.description || "Potent by nature, crafted for your daily ritual. Discover the peak of wellness."}
              </div>

              <ProductActions price={product.price} />
              
              <ReviewSection productId={product.id} reviews={product.reviews || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
