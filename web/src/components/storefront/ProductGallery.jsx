'use client';


export default function ProductGallery({
  images
}) {
  // If no images from DB, fallback to Unsplash placeholders
  const displayImages = images?.length > 0 ? images : [{
    url: "https://images.unsplash.com/photo-1615396899839-c99c14188f00?w=800"
  }, {
    url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2800&auto=format&fit=crop"
  }];
  return <div className="flex flex-col gap-12 w-full pb-32">
      {displayImages.map((image, index) => <div key={index} className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 group">
          <img src={image.url} alt={`Product view ${index + 1}`} className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 60vw" />
        </div>)}
    </div>;
}