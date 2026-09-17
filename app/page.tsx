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
  Menu,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Watch,
  X,
} from "lucide-react";

const categories = [
  { label: "Óculos", detail: "Armações que expressam você", icon: Glasses, className: "category-red" },
  { label: "Joias", detail: "Brilho para todos os momentos", icon: Gem, className: "category-gold" },
  { label: "Relógios", detail: "Seu tempo, seu estilo", icon: Watch, className: "category-ink" },
];

const products = [
  { name: "Solar Acetato", type: "Óculos de sol", price: "R$ 289,90", image: "/otica-hero.png" },
  { name: "Classic Gold", type: "Relógio feminino", price: "R$ 459,90", image: "/otica-hero.png" },
  { name: "Brinco Luz", type: "Semijoia", price: "R$ 129,90", image: "/otica-hero.png" },
];

const galleryImages = [
  { src: "/gallery/loja-fachada.jpg", alt: "Fachada da Ótica Fernandes" },
  { src: "/gallery/loja-balcao.jpg", alt: "Balcão de atendimento com óculos e relógios" },
  { src: "/otica-loja.jpg", alt: "Parede de armações da Ótica Fernandes" },
  { src: "/gallery/loja-vitrine-relogios.jpg", alt: "Vitrine com relógios em exposição" },
  { src: "/gallery/loja-orient.jpg", alt: "Expositor de relógios Orient" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);

  const goToGallerySlide = (index: number) => {
    setGalleryIndex((index + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (galleryPaused) return;
    const timer = setInterval(() => {
      setGalleryIndex((current) => (current + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryPaused]);

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
          <span className="brand-mark">OF</span>
          <span><strong>ÓTICA</strong><b>FERNANDES</b></span>
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
          <p className="eyebrow"><span /> Desde 1987 em Pederneiras</p>
          <h1>Enxergue<br /><em>o seu</em> melhor.</h1>
          <p className="hero-text">Óculos, joias e relógios escolhidos para acompanhar a sua história, o seu ritmo e o seu jeito de ser.</p>
          <div className="hero-actions"><a className="button button-red" href="#produtos">Conheça nossa coleção <ArrowUpRight size={17} /></a><a className="text-link" href="#historia">Nossa história <span>↗</span></a></div>
        </div>
        <div className="hero-visual"><div className="hero-image-wrap"><Image src="/otica-hero.png" alt="Óculos e acessórios em composição elegante" fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="hero-stamp"><span>OF</span><small>EST. 1987<br />PEDERNEIRAS</small></div><div className="hero-note">Curadoria<br /><strong>que combina</strong><br />com você.</div></div>
      </section>

      <section className="category-strip reveal" aria-label="Categorias">
        {categories.map(({ label, detail, icon: Icon, className }) => <a className={`category-card ${className}`} href="#produtos" key={label}><Icon size={30} strokeWidth={1.5} /><div><h2>{label}</h2><p>{detail}</p></div><ArrowUpRight className="category-arrow" size={20} /></a>)}
      </section>

      <section className="section products-section reveal" id="produtos">
        <div className="section-heading"><div><p className="eyebrow"><span /> Seleção Fernandes</p><h2>Peças para<br /><em>ver e viver.</em></h2></div><a className="text-link" href="#contato">Ver todos os produtos <span>↗</span></a></div>
        <div className="products-grid">{products.map((product, index) => <article className="product-card" key={product.name}><div className={`product-image product-${index}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><button aria-label={`Adicionar ${product.name} aos favoritos`}><Heart size={17} /></button><span className="product-number">0{index + 1}</span></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3></div><strong>{product.price}</strong></div></article>)}</div>
      </section>

      <section className="story-section reveal" id="historia"><div className="story-label">UMA LOJA<br />COM HISTÓRIA</div><div className="story-copy"><p className="eyebrow light"><span /> Sobre a Ótica Fernandes</p><h2>Há quase quatro décadas, <em>cuidando do seu olhar.</em></h2><p>O que começou com um sonho de família se tornou uma referência em Pederneiras. Hoje, seguimos unindo atendimento próximo, curadoria cuidadosa e aquele olhar especial para encontrar o que combina com você.</p><a className="button button-light" href="#contato">Conheça nossa história <ArrowUpRight size={17} /></a></div><div className="story-number">38<small>anos</small></div></section>

      <section className="section gallery-section reveal">
        <div className="section-heading"><div><p className="eyebrow"><span /> Nossa loja</p><h2>Um passeio pelo<br /><em>nosso espaço.</em></h2></div></div>
        <div
          className="gallery-carousel"
          onMouseEnter={() => setGalleryPaused(true)}
          onMouseLeave={() => setGalleryPaused(false)}
        >
          <div className="gallery-track" style={{ transform: `translateX(-${galleryIndex * 100}%)` }}>
            {galleryImages.map((image) => (
              <div className="gallery-slide" key={image.src}>
                <Image className="gallery-slide-bg" src={image.src} alt="" aria-hidden fill sizes="100vw" />
                <Image className="gallery-slide-fg" src={image.src} alt={image.alt} fill sizes="100vw" />
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
                key={image.src}
                className={`gallery-dot ${index === galleryIndex ? "is-active" : ""}`}
                onClick={() => goToGallerySlide(index)}
                aria-label={`Ir para foto ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="values-section reveal"><div><p className="eyebrow"><span /> Por que Fernandes</p><h2>Detalhes que fazem<br /><em>toda diferença.</em></h2></div><div className="values-grid"><div><ShieldCheck /><h3>Confiança de verdade</h3><p>Atendimento próximo e transparente em cada escolha.</p></div><div><Sparkles /><h3>Curadoria especial</h3><p>Peças selecionadas para todos os estilos e momentos.</p></div><div><Heart /><h3>Feito para você</h3><p>Porque cada pessoa merece encontrar seu próprio jeito de brilhar.</p></div></div></section>

      <section className="contact-section reveal" id="contato"><div><p className="eyebrow light"><span /> Venha nos visitar</p><h2>Seu próximo<br /><em>olhar começa aqui.</em></h2></div><div className="contact-info"><p><MapPin size={19} /> Rua Siqueira Campos, 123<br /><span>Pederneiras · SP</span></p><p><Clock3 size={19} /> Segunda a sexta, 9h às 18h<br /><span>Sábado, 9h às 13h</span></p><a className="button button-yellow" href="tel:+551432812345"><Phone size={17} /> Fale com a gente</a></div></section>

      <footer className="footer"><a className="brand brand-footer" href="#inicio"><span className="brand-mark">OF</span><span><strong>ÓTICA</strong><b>FERNANDES</b></span></a><p>Óculos · Joias · Relógios · Semijoias</p><small>© 2025 Ótica Fernandes. Feito com cuidado em Pederneiras.</small></footer>
    </main>
  );
}
