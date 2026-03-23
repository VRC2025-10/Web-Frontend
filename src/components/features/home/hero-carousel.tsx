"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Calendar } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
    );
  }

  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "center" }}
        plugins={[
          Autoplay({ delay: 5000, stopOnInteraction: false }),
        ]}
        className="absolute inset-0"
        aria-label="Featured events"
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 relative h-full">
              {slide.thumbnailUrl ? (
                <Image
                  src={slide.thumbnailUrl}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Calendar className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {count > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          role="tablist"
          aria-label="Slide indicators"
        >
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === current
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70",
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </>
  );
}
