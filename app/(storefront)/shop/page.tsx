import prisma from '@/lib/db';
import ProductCard from '@/components/storefront/ProductCard';
import FilterSidebar from '@/components/storefront/FilterSidebar';

export const metadata = {
  title: 'Shop | Miracle Tree',
  description: 'Explore the full Miracle Tree collection of 100% natural and organic products.',
};

export default async function ShopPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice as string) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined;
  const sort = searchParams.sort as string || 'newest';

  const where: any = { isPublished: true, productType: { not: 'BUNDLE' } };
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { price: 'asc' };
  if (sort === 'price-desc') orderBy = { price: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
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

        <div className="flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500 font-sans">{products.length} products found</p>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-brand-green-100 rounded-3xl">
                <p className="text-2xl font-serif text-brand-dark">No products found.</p>
                <p className="text-brand-dark/60 mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
