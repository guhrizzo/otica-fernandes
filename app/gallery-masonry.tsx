"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import type { GalleryImage } from "@/lib/site-data";

// No lightbox a foto passa pelo otimizador do Next (1920px, qualidade 75, que é
// a única qualidade permitida por padrão no Next 16), para que fotos enviadas
// direto do celular pelo painel não sejam baixadas com vários MB.
const lightboxSrc = (url: string) => `/_next/image?url=${encodeURIComponent(url)}&w=1920&q=75`;

export default function GalleryMasonry({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <>
      <div className="gallery-masonry">
        {images.map((image, index) => (
          <button
            type="button"
            className="gallery-tile"
            key={image.id}
            onClick={() => setOpenIndex(index)}
            aria-label={`Ampliar foto${image.alt ? `: ${image.alt}` : ""}`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={0}
              height={0}
              sizes="(max-width: 700px) 50vw, 33vw"
              style={{ width: "100%", height: "auto" }}
            />
            <span className="gallery-tile-icon" aria-hidden>
              <ZoomIn size={18} />
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={openIndex >= 0}
        index={openIndex}
        close={() => setOpenIndex(-1)}
        slides={images.map((image) => ({ src: lightboxSrc(image.url), alt: image.alt }))}
        plugins={[Zoom, Counter]}
        // O zoom máximo é a largura da foto × maxZoomPixelRatio ÷ largura na tela.
        // Com 1,5 uma foto de 1200px chega a ~5x no celular e ~2,5x no desktop;
        // acima disso as fotos (vindas do WhatsApp, até 1600px) ficam borradas.
        zoom={{ maxZoomPixelRatio: 1.5, doubleClickMaxStops: 2, scrollToZoom: true, pinchZoomV4: true }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        carousel={{ finite: images.length <= 1 }}
        labels={{
          Previous: "Foto anterior",
          Next: "Próxima foto",
          Close: "Fechar",
          "Zoom in": "Aproximar",
          "Zoom out": "Afastar",
          Lightbox: "Visualizador de fotos",
          "Photo gallery": "Galeria de fotos",
          Carousel: "carrossel",
          Slide: "foto",
          "{index} of {total}": "{index} de {total}",
        }}
      />
    </>
  );
}
