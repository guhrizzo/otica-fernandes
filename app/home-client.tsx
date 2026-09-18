"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gem,
  Glasses,
  Heart,
  Mail,
  Menu,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Watch,
  X,
} from "lucide-react";
import { contactLinks, stores } from "@/lib/site-data";
import type { GalleryImage, Product, SiteSettings, Store } from "@/lib/site-data";

const categories = [
  { label: "Óculos", detail: "Armações que expressam você", icon: Glasses, className: "category-red" },
  { label: "Joias", detail: "Brilho para todos os momentos", icon: Gem, className: "category-gold" },
  { label: "Relógios", detail: "Seu tempo, seu estilo", icon: Watch, className: "category-ink" },
];

const digitsOf = (value: string) => value.replace(/\D/g, "");

const mapsUrl = (store: Store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Ótica Fernandes, ${store.address.replace(" · ", ", ")}, ${store.city}, SP`)}`;

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type HomeClientProps = {
  products: Product[];
  galleryImages: GalleryImage[];
  settings: SiteSettings;
};

export default function HomeClient({ products, galleryImages, settings }: HomeClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);

  const goToGallerySlide = (index: number) => {
    setGalleryIndex((index + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (galleryPaused || galleryImages.length === 0) return;
    const timer = setInterval(() => {
      setGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryPaused, galleryImages.length]);

  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const transition =
      "opacity .9s cubic-bezier(.22,1,.36,1), filter .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)";

    // O Windows, no modo "ajustar para obter um melhor desempenho", reporta
    // prefers-reduced-motion: reduce ao navegador, o que faz o Chrome/Edge
    // pular transições CSS. Definimos a transição direto no elemento via JS
    // para forçar a animação mesmo nesse cenário.
    revealEls.forEach((el) => {
      el.style.transition = transition;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ótica Fernandes, início">
          <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#inicio">Início</a><a href="#historia">História</a><a href="#produtos">Produtos</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && <nav className="mobile-nav"><a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a><a href="#historia" onClick={() => setMenuOpen(false)}>História</a><a href="#produtos" onClick={() => setMenuOpen(false)}>Produtos</a></nav>}
      </header>

      <section className="hero reveal" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span /> {settings.hero_eyebrow}</p>
          <h1>Enxergue<br /><em>o seu</em> melhor.</h1>
          <p className="hero-text">{settings.hero_text}</p>
          <div className="hero-actions"><a className="button button-red" href="#produtos">Conheça nossa coleção <ArrowUpRight size={17} /></a><a className="text-link" href="#historia">Nossa história <span>↗</span></a></div>
        </div>
        <div className="hero-visual"><div className="hero-image-wrap"><Image src="/otica-hero.png" alt="Óculos e acessórios em composição elegante" fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="hero-stamp"><span>OF</span><small>DESDE 1976<br />PEDERNEIRAS</small></div><div className="hero-note">Curadoria<br /><strong>que combina</strong><br />com você.</div></div>
      </section>

      <section className="category-strip reveal" aria-label="Categorias">
        {categories.map(({ label, detail, icon: Icon, className }) => <a className={`category-card ${className}`} href="#produtos" key={label}><Icon size={30} strokeWidth={1.5} /><div><h2>{label}</h2><p>{detail}</p></div><ArrowUpRight className="category-arrow" size={20} /></a>)}
      </section>

      <section className="section products-section reveal" id="produtos">
        <div className="section-heading"><div><p className="eyebrow"><span /> Seleção Fernandes</p><h2>Peças para<br /><em>ver e viver.</em></h2></div><a className="text-link" href="#contato">Ver todos os produtos <span>↗</span></a></div>
        <div className="products-grid">{products.map((product, index) => <article className="product-card" key={product.id}><div className={`product-image product-${index % 3}`}><Image src={product.image_url || "/otica-hero.png"} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><button aria-label={`Adicionar ${product.name} aos favoritos`}><Heart size={17} /></button><span className="product-number">0{index + 1}</span></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3></div><strong>{priceFormatter.format(product.price)}</strong></div></article>)}</div>
      </section>

      <section className="story-section reveal" id="historia"><div className="story-label">UMA LOJA<br />COM HISTÓRIA</div><div className="story-copy"><p className="eyebrow light"><span /> Sobre a Ótica Fernandes</p><h2>Há cinco décadas, <em>cuidando do seu olhar.</em></h2><p>{settings.story_text}</p><a className="button button-light" href="#contato">Conheça nossa história <ArrowUpRight size={17} /></a></div><div className="story-number">{settings.story_years}<small>anos</small></div></section>

      <section className="section gallery-section reveal">
        <div className="section-heading"><div><p className="eyebrow"><span /> Nossa loja</p><h2>Um passeio pelo<br /><em>nosso espaço.</em></h2></div></div>
        <div
          className="gallery-carousel"
          onMouseEnter={() => setGalleryPaused(true)}
          onMouseLeave={() => setGalleryPaused(false)}
        >
          <div className="gallery-track" style={{ transform: `translateX(-${galleryIndex * 100}%)` }}>
            {galleryImages.map((image) => (
              <div className="gallery-slide" key={image.id}>
                <Image className="gallery-slide-bg" src={image.url} alt="" aria-hidden fill sizes="100vw" />
                <Image className="gallery-slide-fg" src={image.url} alt={image.alt} fill sizes="100vw" />
              </div>
            ))}
          </div>
          <button className="gallery-arrow gallery-arrow-prev" onClick={() => goToGallerySlide(galleryIndex - 1)} aria-label="Foto anterior">
            <ChevronLeft size={20} />
          </button>
          <button className="gallery-arrow gallery-arrow-next" onClick={() => goToGallerySlide(galleryIndex + 1)} aria-label="Próxima foto">
            <ChevronRight size={20} />
          </button>
          <div className="gallery-dots">
            {galleryImages.map((image, index) => (
              <button
                key={image.id}
                className={`gallery-dot ${index === galleryIndex ? "is-active" : ""}`}
                onClick={() => goToGallerySlide(index)}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="values-section reveal"><div><p className="eyebrow"><span /> Por que Fernandes</p><h2>Detalhes que fazem<br /><em>toda diferença.</em></h2></div><div className="values-grid"><div><ShieldCheck /><h3>Confiança de verdade</h3><p>Atendimento próximo e transparente em cada escolha.</p></div><div><Sparkles /><h3>Curadoria especial</h3><p>Peças selecionadas para todos os estilos e momentos.</p></div><div><Heart /><h3>Feito para você</h3><p>Porque cada pessoa merece encontrar seu próprio jeito de brilhar.</p></div></div></section>

      <section className="contact-section reveal" id="contato"><div><p className="eyebrow light"><span /> Venha nos visitar</p><h2>Seu próximo<br /><em>olhar começa aqui.</em></h2></div><div className="contact-info"><p><Clock3 size={19} /> {settings.hours_weekday}<br /><span>{settings.hours_saturday}</span></p><p><Mail size={19} /> <a href={`mailto:${contactLinks.email}`}>{contactLinks.email}</a></p><p className="contact-social"><a href={contactLinks.instagram.url} target="_blank" rel="noopener noreferrer">Instagram {contactLinks.instagram.handle}</a><a href={contactLinks.facebook.url} target="_blank" rel="noopener noreferrer">Facebook {contactLinks.facebook.handle}</a></p></div>
        <div className="stores-grid">{stores.map((store) => <article className="store-card" key={store.id} style={{ backgroundImage: `linear-gradient(180deg, rgba(40,2,10,.82) 0%, rgba(40,2,10,.88) 45%, rgba(40,2,10,.96) 100%), url(${store.photo})` }}><h3>{store.name}<small>{store.city}</small></h3><p className="store-address"><MapPin size={17} /> <a href={mapsUrl(store)} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${store.name} no Google Maps`}>{store.address}</a></p><div className="store-actions"><a href={`tel:+55${digitsOf(store.phone)}`}><Phone size={15} /> {store.phone}</a><a href={`https://wa.me/55${digitsOf(store.whatsapp)}?text=${encodeURIComponent(settings.whatsapp_message)}`} target="_blank" rel="noopener noreferrer">WhatsApp {store.whatsapp}</a></div></article>)}</div>
      </section>

      <footer className="footer"><a className="brand brand-footer" href="#inicio"><Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} /></a><p>Óculos · Joias · Relógios · Semijoias</p><div className="footer-credit"><small>© {new Date().getFullYear()} Ótica Fernandes. Feito com cuidado em Pederneiras.</small><small>Desenvolvido por <a href="https://www.instagram.com/gfrizzo_/?hl=pt" target="_blank" rel="noopener noreferrer">Gustavo Rizzo</a></small></div></footer>

      <a
        className="whatsapp-fab"
        href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <span className="whatsapp-badge">1</span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5l-1.4 5.12 5.24-1.37a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.81.83-3.03-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.86.85-.86 2.06 0 1.22.88 2.4 1 2.56.13.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
        </svg>
        <span className="whatsapp-tooltip">Fale conosco</span>
      </a>
    </main>
  );
}
