import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductArt from './ProductArt';

// Product photos with thumbnails, or the illustrated pack when there are none
export default function ProductGallery({ images, product }) {
  const displayImages = images?.filter((image) => image.url) || [];
  const [active, setActive] = useState(0);

  if (displayImages.length === 0) {
    return product ? <ProductArt product={product} size="hero" /> : null;
  }

  const step = (delta) => setActive((active + delta + displayImages.length) % displayImages.length);

  return (
    <div className="pp-gallery">
      <div className="pp-gallery-main">
        <img src={displayImages[active]?.url} alt={product ? product.name : 'Product'} />
        {displayImages.length > 1 && (
          <>
            <button type="button" className="pp-gallery-arrow pp-gallery-arrow--prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={22} aria-hidden="true" /></button>
            <button type="button" className="pp-gallery-arrow pp-gallery-arrow--next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={22} aria-hidden="true" /></button>
          </>
        )}
      </div>
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
