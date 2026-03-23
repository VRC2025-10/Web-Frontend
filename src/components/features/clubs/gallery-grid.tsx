"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/features/clubs/image-lightbox";

interface GalleryImage {
  id: string;
  image_url: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxImages = images.map((img) => ({ src: img.image_url }));

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-8 [column-fill:_balance] supports-[grid-template-rows:masonry]:grid supports-[grid-template-rows:masonry]:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] supports-[grid-template-rows:masonry]:[grid-template-rows:masonry]">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="relative rounded-xl overflow-hidden group mb-4 break-inside-avoid w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => openLightbox(index)}
            aria-label={`View image ${index + 1} of ${images.length}`}
          >
            <Image
              src={image.image_url}
              alt=""
              width={400}
              height={300}
              className="object-cover w-full h-auto transition-transform group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
