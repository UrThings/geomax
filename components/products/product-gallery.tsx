"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; alt?: string | null };

export function ProductGallery({
  images,
  name,
}: {
  images: GalleryImage[];
  name: string;
}) {
  const [active, setActive] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
        <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  function goTo(index: number) {
    setActive((index + images.length) % images.length);
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) {
            goTo(delta < 0 ? active + 1 : active - 1);
          }
          touchStartX.current = null;
        }}
      >
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain"
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Өмнөх зураг"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-opacity hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Дараах зураг"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm transition-opacity hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              {active + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Зургийн жагсаалт"
        >
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Зураг ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-20 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-muted transition-colors sm:h-20 sm:w-24",
                index === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}