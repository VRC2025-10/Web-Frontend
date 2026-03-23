"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: { src: string; alt?: string }[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrent(initialIndex);
      setDirection(0);
    }
  }, [isOpen, initialIndex]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    // Focus close button on open
    requestAnimationFrame(() => closeRef.current?.focus());

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusables = [closeRef.current, prevRef.current, nextRef.current].filter(
        (el): el is HTMLButtonElement => el !== null && !el.disabled
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const isFirst = current === 0;
  const isLast = current === images.length - 1;

  const prev = useCallback(() => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }, [current]);

  const next = useCallback(() => {
    if (current < images.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }, [current, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":
          if (current > 0) {
            setDirection(-1);
            setCurrent((c) => c - 1);
          }
          break;
        case "ArrowRight":
          if (current < images.length - 1) {
            setDirection(1);
            setCurrent((c) => c + 1);
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, current, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const image = images[current];

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir * 50,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir * -50,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery viewer"
          aria-roledescription="carousel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Close button */}
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur-sm rounded-full"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Previous */}
          {images.length > 1 && (
            <Button
              ref={prevRef}
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 bg-background/50 backdrop-blur-sm rounded-full"
              onClick={prev}
              disabled={isFirst}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Image */}
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center px-16">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
              >
                <Image
                  src={image.src}
                  alt={image.alt || `Gallery image ${current + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next */}
          {images.length > 1 && (
            <Button
              ref={nextRef}
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 bg-background/50 backdrop-blur-sm rounded-full"
              onClick={next}
              disabled={isLast}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full"
              aria-live="polite"
            >
              {current + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
