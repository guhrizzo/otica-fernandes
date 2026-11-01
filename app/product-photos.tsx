"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Fotos do produto no card: deslizar no celular, setas e bolinhas no computador. */
export default function ProductPhotos({ images, name }: { images: string[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  if (images.length <= 1) {
    return (
      <div className="product-image">
        <Image src={images[0] || "/otica-hero.png"} alt={name} fill sizes="(max-width: 800px) 100vw, 33vw" />
      </div>
    );
  }

  function goTo(index: number) {
    const el = track.current;
    if (!el) return;
    const target = (index + images.length) % images.length;
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="product-image product-carousel" aria-roledescription="carrossel" aria-label={`Fotos de ${name}`}>
      <div
        className="product-carousel-track"
        ref={track}
        onScroll={(event) => {
          const el = event.currentTarget;
          setCurrent(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.map((src, index) => (
          <div className="product-carousel-slide" key={src} aria-label={`Foto ${index + 1} de ${images.length}`}>
            <Image src={src} alt={index === 0 ? name : `${name}, foto ${index + 1}`} fill sizes="(max-width: 800px) 100vw, 33vw" />
          </div>
        ))}
      </div>
      <button type="button" className="product-carousel-arrow is-prev" onClick={() => goTo(current - 1)} aria-label="Foto anterior">
        <ChevronLeft size={18} />
      </button>
      <button type="button" className="product-carousel-arrow is-next" onClick={() => goTo(current + 1)} aria-label="Próxima foto">
        <ChevronRight size={18} />
      </button>
      <div className="product-carousel-dots">
        {images.map((src, index) => (
          <button
            type="button"
            key={src}
            className={index === current ? "is-active" : undefined}
            onClick={() => goTo(index)}
            aria-label={`Ver foto ${index + 1}`}
            aria-current={index === current}
          />
        ))}
      </div>
    </div>
  );
}
