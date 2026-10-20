import { useState } from 'react';
import ProductArt from './ProductArt';

// Product photos with thumbnails, or the illustrated pack when there are none
export default function ProductGallery({ images, product }) {
  const displayImages = images?.filter((image) => image.url) || [];
  const [active, setActive] = useState(0);

  if (displayImages.length === 0) {
    return product ? <ProductArt product={product} size="hero" /> : null;
  }

  return (
    <div className="pp-gallery">
      <img src={displayImages[active]?.url} alt={product ? product.name : 'Product'} />
      {displayImages.length > 1 && (
        <div className="pp-thumbs">
          {displayImages.map((image, index) => (
            <button key={`${image.url}-${index}`} type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`}>
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
