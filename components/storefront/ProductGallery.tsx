'use client';

import Image from 'next/image';

export default function ProductGallery({ images }: { images: any[] }) {
  // If no images from DB, fallback to Unsplash placeholders
  const displayImages = images?.length > 0 ? images : [
    { url: "https://images.unsplash.com/photo-1615397323171-897dbb25dfdd?q=80&w=2940&auto=format&fit=crop" },
    { url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2800&auto=format&fit=crop" }
  ];

  return (
    <div className="flex flex-col gap-12 w-full pb-32">
      {displayImages.map((image, index) => (
        <div 
          key={index} 
          className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 group"
        >
          <Image
            src={image.url}
            alt={`Product view ${index + 1}`}
            fill
            className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
