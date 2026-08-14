import prisma from '@/lib/db';
import ProductCard from '@/components/storefront/ProductCard';

export const metadata = {
  title: 'Shop | Miracle Tree',
  description: 'Explore the full Miracle Tree collection of 100% natural and organic products.',
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-brand-pearl pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-16 text-center md:text-left mt-8">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-4 tracking-tighter">
            Our Collection
          </h1>
          <p className="text-lg text-brand-dark/70 font-light max-w-xl">
            Discover our full range of scientifically-backed, 100% natural botanical products. Pure power from nature to you.
          </p>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-brand-green-100 rounded-3xl">
            <p className="text-2xl font-serif text-brand-dark">No products found.</p>
            <p className="text-brand-dark/60 mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
