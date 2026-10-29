import ProductArt from './ProductArt';

// The product as shown around the site: its main photo from the admin panel when it
// has one, otherwise the illustrated Jayam pack. Photos keep the pack's 260:320 frame
// and soft 3D shadow, so a cut-out PNG (transparent background) stands on the page
// exactly like the drawing does.
export default function ProductVisual({ product, size = 'card', eager = false }) {
  const photo = product.images?.find((image) => image?.url)?.url;
  if (!photo) return <ProductArt product={product} size={size} />;

  return (
    <div className={`pv pv--${size}`} role="img" aria-label={product.name}>
      <img className="jayam-pack" src={photo} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  );
}
