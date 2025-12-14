import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  display_order: number;
}

export function ShowcaseGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex !== null && images) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }, [lightboxIndex, images]);

  const goPrev = useCallback(() => {
    if (lightboxIndex !== null && images) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  }, [lightboxIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, goNext, goPrev]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-background">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="h-4 w-24 mx-auto bg-secondary rounded animate-pulse mb-4" />
            <div className="h-8 w-48 mx-auto bg-secondary rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              {[4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!images || images.length === 0) return null;

  // Split images into two columns
  const leftColumn = images.filter((_, i) => i % 2 === 0);
  const rightColumn = images.filter((_, i) => i % 2 === 1);

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container-page">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="section-label mb-3">Gallery</p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Our Story in Pictures
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column */}
          <div className="space-y-4 lg:space-y-6">
            {leftColumn.map((image, idx) => {
              const actualIndex = idx * 2;
              return (
                <button
                  key={image.id}
                  onClick={() => openLightbox(actualIndex)}
                  className="group relative block w-full overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-4 focus:ring-primary-border"
                  aria-label={`View ${image.alt_text}`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4 lg:space-y-6">
            {rightColumn.map((image, idx) => {
              const actualIndex = idx * 2 + 1;
              return (
                <button
                  key={image.id}
                  onClick={() => openLightbox(actualIndex)}
                  className="group relative block w-full overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-4 focus:ring-primary-border"
                  aria-label={`View ${image.alt_text}`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation - Previous */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Image */}
          <div className="max-w-4xl max-h-[80vh] px-16">
            <img
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].alt_text}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {images[lightboxIndex].caption && (
              <p className="mt-4 text-center text-white/80">
                {images[lightboxIndex].caption}
              </p>
            )}
            <p className="mt-2 text-center text-white/50 text-sm">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          {/* Navigation - Next */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Touch/swipe hint on mobile */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            Use ← → keys to navigate
          </p>
        </div>
      )}
    </section>
  );
}
