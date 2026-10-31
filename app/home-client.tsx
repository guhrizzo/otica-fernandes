"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Clock3, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { contactLinks, stores } from "@/lib/site-data";
import GalleryMasonry from "./gallery-masonry";
import type { GalleryImage, Product, SiteSettings, Store } from "@/lib/site-data";

const categories = [
  { label: "Óculos de grau e de sol", detail: "Armações para o dia a dia, para o trabalho e para o sol.", photo: "/gallery/salao-atendimento.jpg", alt: "Salão com expositores de armações", ask: "Olá! Quero ver opções de óculos." },
  { label: "Relógios", detail: "Modelos clássicos, esportivos e smartwatches.", photo: "/gallery/parede-relogios.jpg", alt: "Parede de relógios das marcas Lince, Mondaine e Orient", ask: "Olá! Quero ver opções de relógios." },
  { label: "Joias e semijoias", detail: "Anéis, brincos, correntes e peças para presentear.", photo: "/gallery/vitrine-joias.jpg", alt: "Vitrine de vidro com joias e semijoias", ask: "Olá! Quero ver opções de joias e semijoias." },
];

// Marcas que aparecem nos expositores das lojas.
const brands = ["Ray-Ban", "Orient", "Mondaine", "Lince", "Condor", "X-Watch", "Speedo", "Bulget", "Tecnol"];

const navLinks = [
  { href: "#produtos", label: "Produtos" },
  { href: "#historia", label: "História" },
  { href: "#lojas", label: "Lojas" },
];

// O lucide-react 1.x não traz mais ícones de marcas; estes seguem o mesmo traço dele.
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Logo da RizzoWeb redesenhado em vetor, sem o fundo escuro do arquivo original.
const RizzoWebLogo = () => (
  <svg className="rizzoweb-logo" width="20" height="21" viewBox="270 250 580 600" aria-hidden="true">
    <path fill="currentColor" d="M284 265H757L777 337L502 495H757L777 567L502 725H578V802H357L339 730L613 572H357L339 500L613 342H284Z" />
    <circle cx="764" cy="763" r="70" fill="#0d6efd" />
  </svg>
);

const digitsOf = (value: string) => value.replace(/\D/g, "");

const whatsappUrl = (number: string, message: string) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

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
  const cities = Array.from(new Set(stores.map((store) => store.city)));

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

  // Com o menu aberto a página por trás não rola, e o Esc fecha o menu.
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ótica Fernandes, início">
          <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
        </nav>
        <a className="button button-red header-cta" href={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="menu-mobile">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
          <span>{menuOpen ? "Fechar" : "Menu"}</span>
        </button>
      </header>

      <div className={`mobile-menu${menuOpen ? " is-open" : ""}`} id="menu-mobile" inert={!menuOpen}>
        <nav aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
              {link.label} <ArrowRight size={22} aria-hidden />
            </a>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <a className="button button-red" href={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={17} /></a>
          <p><Clock3 size={16} aria-hidden /> <span>{settings.hours_weekday}<br />{settings.hours_saturday}</span></p>
          <p><MapPin size={16} aria-hidden /> <span>{stores.length} lojas em {cities.join(" e ")}</span></p>
        </div>
      </div>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          {/* A abertura imita uma tabela de exame de vista: cada linha menor que a anterior. */}
          <div className="chart">
            <h1>
              <span className="chart-line chart-1"><span className="chart-num" aria-hidden>1</span><span className="chart-text">Enxergue</span><span className="chart-ratio" aria-hidden>20/200</span></span>
              <span className="chart-line chart-2"><span className="chart-num" aria-hidden>2</span><span className="chart-text">o seu melhor</span><span className="chart-ratio" aria-hidden>20/100</span></span>
            </h1>
            <p className="chart-line chart-3"><span className="chart-num" aria-hidden>3</span><span className="chart-text">{settings.hero_eyebrow}</span><span className="chart-ratio" aria-hidden>20/50</span></p>
            <p className="chart-line chart-4"><span className="chart-num" aria-hidden>4</span><span className="chart-text">Óculos · Joias · Relógios · Semijoias</span><span className="chart-ratio" aria-hidden>20/20</span></p>
          </div>
          <p className="hero-text">{settings.hero_text}</p>
          <div className="hero-actions">
            <a className="button button-red" href={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={17} /></a>
            <a className="button button-outline" href="#lojas">Ver endereços das lojas <ArrowRight size={17} /></a>
          </div>
        </div>
        <div className="hero-visual">
          <Image src="/gallery/fachada-portico.jpg" alt="Fachada vermelha da Ótica Fernandes" fill priority sizes="(max-width: 900px) 100vw, 45vw" />
        </div>
      </section>

      <section className="facts" aria-label="Informações rápidas">
        <p><strong>{stores.length} lojas</strong><span>{cities.join(" e ")}</span></p>
        <p><strong>Desde 1976</strong><span>{settings.story_years} anos de atendimento em família</span></p>
        <p><strong><Clock3 size={16} aria-hidden /> Horário</strong><span>{settings.hours_weekday} · {settings.hours_saturday}</span></p>
      </section>

      <section className="section categories-section reveal" aria-labelledby="categorias-titulo">
        <div className="section-heading">
          <p className="label">O que você encontra</p>
          <h2 id="categorias-titulo">Tudo para ver bem,<br />e para ficar bem.</h2>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <a className="category-card" href={whatsappUrl(settings.whatsapp_number, category.ask)} target="_blank" rel="noopener noreferrer" key={category.label}>
              <div className="category-photo"><Image src={category.photo} alt={category.alt} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
              <h3>{category.label}</h3>
              <p>{category.detail}</p>
              <span className="category-link">Perguntar no WhatsApp <ArrowUpRight size={15} /></span>
            </a>
          ))}
        </div>
        <div className="brands">
          <p className="label">Marcas nas nossas vitrines</p>
          <ul>{brands.map((brand) => <li key={brand}>{brand}</li>)}</ul>
        </div>
      </section>

      <section className="section products-section reveal" id="produtos" aria-labelledby="produtos-titulo">
        <div className="section-heading section-heading-row">
          <div>
            <p className="label">Na vitrine agora</p>
            <h2 id="produtos-titulo">Escolhidos a dedo<br />pela nossa equipe.</h2>
          </div>
          <a className="text-link" href={contactLinks.instagram.url} target="_blank" rel="noopener noreferrer">Mais novidades no Instagram <ArrowUpRight size={15} /></a>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image"><Image src={product.image_url || "/otica-hero.png"} alt={product.name} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
              <div className="product-meta">
                <p>{product.type}</p>
                <h3>{product.name}</h3>
                <strong>{priceFormatter.format(product.price)}</strong>
              </div>
              <a className="product-ask" href={whatsappUrl(settings.whatsapp_number, `Olá! Tenho interesse no ${product.name} (${priceFormatter.format(product.price)}).`)} target="_blank" rel="noopener noreferrer">Tenho interesse <ArrowUpRight size={15} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section reveal" id="historia" aria-labelledby="historia-titulo">
        <div className="story-photo"><Image src="/gallery/recepcao.jpg" alt="Recepção da Ótica Fernandes" fill sizes="(max-width: 800px) 100vw, 45vw" /></div>
        <div className="story-copy">
          <p className="label label-light">Nossa história</p>
          <h2 id="historia-titulo">Uma família cuidando do seu olhar desde 1976.</h2>
          <p>{settings.story_text}</p>
          <dl className="story-points">
            <div><dt>{settings.story_years}</dt><dd>anos de loja</dd></div>
            <div><dt>{stores.length}</dt><dd>lojas na região</dd></div>
            <div><dt>{cities.length}</dt><dd>cidades atendidas</dd></div>
          </dl>
        </div>
      </section>

      <section className="section gallery-section reveal" aria-labelledby="galeria-titulo">
        <div className="section-heading">
          <p className="label">Por dentro das lojas</p>
          <h2 id="galeria-titulo">Espaço para escolher<br />com calma e sem pressa.</h2>
        </div>
        <GalleryMasonry images={galleryImages} />
      </section>

      <section className="section stores-section reveal" id="lojas" aria-labelledby="lojas-titulo">
        <div className="section-heading section-heading-row">
          <div>
            <p className="label">Nossas lojas</p>
            <h2 id="lojas-titulo">Escolha a loja<br />mais perto de você.</h2>
          </div>
          <p className="stores-hours"><Clock3 size={17} aria-hidden /> <span>{settings.hours_weekday}<br />{settings.hours_saturday}</span></p>
        </div>
        <div className="stores-grid">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <div className="store-photo"><Image src={store.photo} alt={`Fachada da ${store.name} em ${store.city}`} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
              <div className="store-body">
                <p className="store-city">{store.city}</p>
                <h3>{store.name}</h3>
                <p className="store-address"><MapPin size={16} aria-hidden /> {store.address}</p>
                <div className="store-actions">
                  <a className="button button-red" href={`https://wa.me/55${digitsOf(store.whatsapp)}?text=${encodeURIComponent(settings.whatsapp_message)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp da ${store.name}: ${store.whatsapp}`}>WhatsApp</a>
                  <a className="button button-outline" href={mapsUrl(store)} target="_blank" rel="noopener noreferrer" aria-label={`Como chegar na ${store.name}`}>Como chegar</a>
                  <a className="button button-tint store-phone" href={`tel:+55${digitsOf(store.phone)}`} aria-label={`Ligar para a ${store.name}: ${store.phone}`}><Phone size={16} aria-hidden /> Ligar {store.phone}</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <a className="brand brand-footer" href="#inicio" aria-label="Ótica Fernandes, início"><Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} /></a>
          <div className="footer-col">
            <p className="label">Contato</p>
            <a href={`mailto:${contactLinks.email}`}><Mail size={18} aria-hidden /> <span>{contactLinks.email}</span></a>
            <a href={contactLinks.instagram.url} target="_blank" rel="noopener noreferrer"><InstagramIcon /> <span>{contactLinks.instagram.handle}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>
            <a href={contactLinks.facebook.url} target="_blank" rel="noopener noreferrer"><FacebookIcon /> <span>{contactLinks.facebook.handle}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>
          </div>
          <div className="footer-col">
            <p className="label">Lojas</p>
            {stores.map((store) => <a href={mapsUrl(store)} target="_blank" rel="noopener noreferrer" key={store.id}><MapPin size={18} aria-hidden /> <span>{store.name} · {store.city}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>)}
          </div>
        </div>
        <div className="footer-credit">
          <small>© {new Date().getFullYear()} Ótica Fernandes. Feito com cuidado em Pederneiras.</small>
          <small className="footer-dev">Desenvolvido por <a href="https://www.instagram.com/gfrizzo_/?hl=pt" target="_blank" rel="noopener noreferrer"><RizzoWebLogo /> <span>Gustavo Rizzo</span></a></small>
        </div>
      </footer>

      <a
        className="whatsapp-fab"
        href={whatsappUrl(settings.whatsapp_number, settings.whatsapp_message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5l-1.4 5.12 5.24-1.37a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.81.83-3.03-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.24-.86.85-.86 2.06 0 1.22.88 2.4 1 2.56.13.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
        </svg>
        <span className="whatsapp-tooltip">Fale conosco</span>
      </a>
    </main>
  );
}
