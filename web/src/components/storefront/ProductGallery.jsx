import ProductArt from './ProductArt';

export default function ProductGallery({
  images,
  product
}) {
  const displayImages = images?.filter((image) => image.url) || [];
  if (displayImages.length === 0) {
    return product
      ? <ProductArt product={product} size="hero" />
      : <div className="jayam-product-no-image" role="img" aria-label="No product image available">J</div>;
  }
  return <div className="flex flex-col gap-12 w-full pb-32">
      {displayImages.map((image, index) => <div key={`${image.url}-${index}`} className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 group">
          <img src={image.url} alt={`Product view ${index + 1}`} className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
        </div>)}
    </div>;
}