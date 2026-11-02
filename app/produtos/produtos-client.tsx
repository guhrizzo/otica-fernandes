"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Package, Search } from "lucide-react";
import ProductCard from "../product-card";
import SiteFooter from "../site-footer";
import StoreStatus from "../store-status";
import { stores } from "@/lib/site-data";
import type { Product } from "@/lib/site-data";
import type { StoreHours } from "@/lib/store-hours";

type Sort = "default" | "price-asc" | "price-desc";

const ALL = "Todos";

const navLinks = [
  { href: "/produtos", label: "Produtos" },
  { href: "/#historia", label: "História" },
  { href: "/#lojas", label: "Lojas" },
];

// Compara sem acento e sem diferença de maiúscula: "relogio" encontra "Relógio".
const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Props = { products: Product[]; whatsappNumber: string; whatsappMessage: string; storeHours: StoreHours };

export default function ProdutosClient({ products, whatsappNumber, whatsappMessage, storeHours }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [store, setStore] = useState(ALL);
  const [sort, setSort] = useState<Sort>("default");

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.type).filter(Boolean))), [products]);
  const storeNames = useMemo(() => Array.from(new Set(products.flatMap((p) => p.available_at ?? []))), [products]);

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    const list = products.filter((p) => {
      if (category !== ALL && p.type !== category) return false;
      if (store !== ALL && !p.available_at?.includes(store)) return false;
      if (term && !normalize(`${p.name} ${p.type} ${p.description ?? ""}`).includes(term)) return false;
      return true;
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, query, category, store, sort]);

  const filtered = query.trim() !== "" || category !== ALL || store !== ALL;
  const clear = () => {
    setQuery("");
    setCategory(ALL);
    setStore(ALL);
  };
  const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ótica Fernandes, página inicial">
          <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navLinks.map((link) => <Link href={link.href} key={link.href} aria-current={link.href === "/produtos" ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <StoreStatus hours={storeHours} />
        <Link className="header-home" href="/">Início <ArrowRight size={15} aria-hidden /></Link>
        <a className="button button-red header-cta" href={whatsapp} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
      </header>

      <section className="catalog-hero">
        <div>
          <p className="label label-light">Catálogo</p>
          <h1>Todos os produtos</h1>
          <p className="catalog-lead">Óculos, relógios, joias e semijoias. Escolha o que gostou e fale com a gente pelo WhatsApp para confirmar a disponibilidade na loja mais perto de você.</p>
        </div>
        <dl className="catalog-stats">
          <div><dt>{products.length}</dt><dd>{products.length === 1 ? "produto" : "produtos"}</dd></div>
          <div><dt>{stores.length}</dt><dd>lojas</dd></div>
        </dl>
      </section>

      <section className="section catalog-section">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, ex.: óculos de sol" aria-label="Buscar produto" />
          </label>
          {storeNames.length > 0 && (
            <label className="catalog-select">
              <span>Loja</span>
              <select value={store} onChange={(e) => setStore(e.target.value)}>
                <option value={ALL}>Todas as lojas</option>
                {storeNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          )}
          <label className="catalog-select">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="default">Destaques</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </label>
        </div>

        {categories.length > 1 && (
          <div className="catalog-chips" role="group" aria-label="Filtrar por categoria">
            {[ALL, ...categories].map((name) => (
              <button type="button" key={name} className={`catalog-chip${category === name ? " is-active" : ""}`} aria-pressed={category === name} onClick={() => setCategory(name)}>
                {name}
              </button>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <p className="catalog-count" aria-live="polite">
            {visible.length === 1 ? "1 produto" : `${visible.length} produtos`}
            {filtered && <button type="button" className="catalog-clear" onClick={clear}>Limpar filtros</button>}
          </p>
        )}

        {products.length === 0 ? (
          <div className="catalog-empty">
            <span className="catalog-empty-icon" aria-hidden><Package size={30} /></span>
            <h2>Nenhum produto cadastrado no momento</h2>
            <p>Estamos atualizando a vitrine. Fale com a gente e veja o que temos disponível nas lojas.</p>
            <div className="catalog-empty-actions">
              <a className="button button-red" href={whatsapp} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={17} /></a>
              <Link className="button button-outline" href="/">Voltar ao início</Link>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="catalog-empty">
            <span className="catalog-empty-icon" aria-hidden><Search size={30} /></span>
            <h2>Nenhum produto encontrado</h2>
            <p>Tente outro nome ou limpe os filtros para ver tudo de novo.</p>
            <div className="catalog-empty-actions">
              <button type="button" className="button button-red" onClick={clear}>Limpar filtros</button>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {visible.map((product) => <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />)}
          </div>
        )}
      </section>

      <section className="catalog-cta">
        <div>
          <h2>Não encontrou o que procurava?</h2>
          <p>Temos muito mais nas lojas. Chame no WhatsApp ou venha nos visitar.</p>
        </div>
        <div className="catalog-cta-actions">
          <a className="button button-white" href={whatsapp} target="_blank" rel="noopener noreferrer">Falar no WhatsApp <ArrowUpRight size={17} /></a>
          <Link className="button button-ghost" href="/#lojas">Ver endereços das lojas <ArrowRight size={17} /></Link>
        </div>
      </section>

      <SiteFooter homeHref="/" />
    </main>
  );
}
