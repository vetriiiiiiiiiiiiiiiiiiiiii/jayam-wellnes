import prisma from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Collections | Miracle Tree',
  description: 'Curated bundles and collections from Miracle Tree.',
};

export default async function CollectionsPage() {
  const collections = await prisma.product.findMany({
    where: { 
      productType: 'BUNDLE',
      isPublished: true,
      status: 'PUBLISHED'
    },
    include: {
      images: {
        orderBy: { position: 'asc' }
      },
      relatedTo: {
        where: { type: 'BUNDLE_ITEM' },
        include: {
          relatedProduct: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pt-24 min-h-screen bg-brand-pearl">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-forest-700 mb-6">Our Collections</h1>
          <p className="text-lg text-brand-forest-700/70 font-light">
            Curated bundles designed to provide complete routines for your health and wellness journey.
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="text-center py-20 text-brand-forest-700/50">
            <p>No collections available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {collections.map(collection => (
              <Link href={`/products/${collection.slug}`} key={collection.id} className="group block">
                <div className="relative aspect-[4/3] bg-brand-forest-100 mb-6 overflow-hidden rounded-sm">
                  {collection.images[0] ? (
                    <Image 
                      src={collection.images[0].url} 
                      alt={collection.images[0].altText || collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-forest-700/30">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif text-brand-forest-700 mb-2">{collection.name}</h2>
                    {collection.relatedTo && collection.relatedTo.length > 0 && (
                      <p className="text-sm text-brand-forest-700/60 mb-3">
                        Includes {collection.relatedTo.length} products
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-light text-brand-forest-700">${collection.price.toFixed(2)}</span>
                    {collection.compareAtPrice && collection.compareAtPrice > collection.price && (
                      <div className="text-sm text-brand-forest-700/50 line-through">
                        ${collection.compareAtPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
