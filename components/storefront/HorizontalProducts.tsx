import Image from 'next/image';
import Link from 'next/link';

export default function HorizontalProducts({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-32 bg-brand-pearl border-t border-brand-forest-700/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-forest-700 tracking-tight">
            Curated <span className="italic text-brand-gold">Essentials.</span>
          </h2>
          <Link href="/shop" className="text-sm font-sans font-bold uppercase tracking-widest text-brand-forest-700 hover:text-brand-gold transition-colors pb-2 border-b-2 border-brand-forest-700 hover:border-brand-gold">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => {
            const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1615397323171-897dbb25dfdd?q=80&w=2940&auto=format&fit=crop';
            const secondaryImage = product.images?.[1]?.url || primaryImage;

            return (
              <Link href={`/shop/${product.slug}`} key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-xl bg-gray-100">
                  {/* Primary Image */}
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                  />
                  {/* Secondary Image on Hover */}
                  <Image
                    src={secondaryImage}
                    alt={`${product.name} alternate`}
                    fill
                    className="object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.isNew && (
                      <span className="bg-brand-pearl text-brand-forest-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        New
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-brand-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Hover Button */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-10">
                    <button className="w-full bg-brand-forest-700/90 backdrop-blur-md text-brand-pearl py-4 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-brand-forest-700 transition-colors">
                      Quick Add
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif text-brand-forest-700 group-hover:text-brand-gold transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-sans font-medium text-brand-forest-700">
                      ₹{product.price}
                    </p>
                  </div>
                  <p className="text-sm font-sans text-brand-forest-700/60 line-clamp-1">
                    {product.shortDescription || product.description || 'Elevate your daily ritual.'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
