"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowUpRight,
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <a className="admin-link" href="#contato">Área administrativa <ArrowUpRight size={15} /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && <nav className="mobile-nav"><a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a><a href="#historia" onClick={() => setMenuOpen(false)}>História</a><a href="#produtos" onClick={() => setMenuOpen(false)}>Produtos</a><a href="#contato" onClick={() => setMenuOpen(false)}>Área administrativa</a></nav>}
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Desde 1987 em Pederneiras</p>
          <h1>Enxergue<br /><em>o seu</em> melhor.</h1>
          <p className="hero-text">Óculos, joias e relógios escolhidos para acompanhar a sua história, o seu ritmo e o seu jeito de ser.</p>
          <div className="hero-actions"><a className="button button-red" href="#produtos">Conheça nossa coleção <ArrowUpRight size={17} /></a><a className="text-link" href="#historia">Nossa história <span>↗</span></a></div>
        </div>
        <div className="hero-visual"><div className="hero-image-wrap"><Image src="/otica-hero.png" alt="Óculos e acessórios em composição elegante" fill priority sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="hero-stamp"><span>OF</span><small>EST. 1987<br />PEDERNEIRAS</small></div><div className="hero-note">Curadoria<br /><strong>que combina</strong><br />com você.</div></div>
      </section>

      <section className="category-strip" aria-label="Categorias">
        {categories.map(({ label, detail, icon: Icon, className }) => <a className={`category-card ${className}`} href="#produtos" key={label}><Icon size={30} strokeWidth={1.5} /><div><h2>{label}</h2><p>{detail}</p></div><ArrowUpRight className="category-arrow" size={20} /></a>)}
      </section>

      <section className="section products-section" id="produtos">
        <div className="section-heading"><div><p className="eyebrow"><span /> Seleção Fernandes</p><h2>Peças para<br /><em>ver e viver.</em></h2></div><a className="text-link" href="#contato">Ver todos os produtos <span>↗</span></a></div>
        <div className="products-grid">{products.map((product, index) => <article className="product-card" key={product.name}><div className={`product-image product-${index}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><button aria-label={`Adicionar ${product.name} aos favoritos`}><Heart size={17} /></button><span className="product-number">0{index + 1}</span></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3></div><strong>{product.price}</strong></div></article>)}</div>
      </section>

      <section className="story-section" id="historia"><div className="story-label">UMA LOJA<br />COM HISTÓRIA</div><div className="story-copy"><p className="eyebrow light"><span /> Sobre a Ótica Fernandes</p><h2>Há quase quatro décadas, <em>cuidando do seu olhar.</em></h2><p>O que começou com um sonho de família se tornou uma referência em Pederneiras. Hoje, seguimos unindo atendimento próximo, curadoria cuidadosa e aquele olhar especial para encontrar o que combina com você.</p><a className="button button-light" href="#contato">Conheça nossa história <ArrowUpRight size={17} /></a></div><div className="story-number">38<small>anos</small></div></section>

      <section className="values-section"><div><p className="eyebrow"><span /> Por que Fernandes</p><h2>Detalhes que fazem<br /><em>toda diferença.</em></h2></div><div className="values-grid"><div><ShieldCheck /><h3>Confiança de verdade</h3><p>Atendimento próximo e transparente em cada escolha.</p></div><div><Sparkles /><h3>Curadoria especial</h3><p>Peças selecionadas para todos os estilos e momentos.</p></div><div><Heart /><h3>Feito para você</h3><p>Porque cada pessoa merece encontrar seu próprio jeito de brilhar.</p></div></div></section>

      <section className="contact-section" id="contato"><div><p className="eyebrow light"><span /> Venha nos visitar</p><h2>Seu próximo<br /><em>olhar começa aqui.</em></h2></div><div className="contact-info"><p><MapPin size={19} /> Rua Siqueira Campos, 123<br /><span>Pederneiras · SP</span></p><p><Clock3 size={19} /> Segunda a sexta, 9h às 18h<br /><span>Sábado, 9h às 13h</span></p><a className="button button-yellow" href="tel:+551432812345"><Phone size={17} /> Fale com a gente</a></div></section>

      <footer className="footer"><a className="brand brand-footer" href="#inicio"><span className="brand-mark">OF</span><span><strong>ÓTICA</strong><b>FERNANDES</b></span></a><p>Óculos · Joias · Relógios · Semijoias</p><small>© 2025 Ótica Fernandes. Feito com cuidado em Pederneiras.</small></footer>
    </main>
  );
}
