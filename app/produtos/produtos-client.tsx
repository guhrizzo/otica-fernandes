"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import ProductCard from "../product-card";
import type { Product } from "@/lib/site-data";

type Sort = "default" | "price-asc" | "price-desc";

const ALL = "Todos";

// Compara sem acento e sem diferença de maiúscula: "relogio" encontra "Relógio".
const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Props = { products: Product[]; whatsappNumber: string; whatsappMessage: string };

export default function ProdutosClient({ products, whatsappNumber, whatsappMessage }: Props) {
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

  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ótica Fernandes, página inicial">
          <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <Link href="/" style={{ alignItems: "center", display: "inline-flex" }}><ArrowLeft size={15} aria-hidden style={{ marginRight: 6, verticalAlign: "-2px" }} />Voltar ao início</Link>
        </nav>
        <a className="button button-red header-cta" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
      </header>

      <section className="section catalog-section">
        <div className="section-heading">
          <p className="label">Catálogo</p>
          <h1 className="catalog-title">Todos os produtos</h1>
        </div>

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

        <p className="catalog-count" aria-live="polite">
          {visible.length === 1 ? "1 produto" : `${visible.length} produtos`}
          {filtered && <button type="button" className="catalog-clear" onClick={clear}>Limpar filtros</button>}
        </p>

        {products.length === 0 ? (
          <p className="products-empty">Nenhum produto cadastrado no momento.</p>
        ) : visible.length === 0 ? (
          <p className="products-empty">Nenhum produto encontrado com esses filtros.</p>
        ) : (
          <div className="products-grid">
            {visible.map((product) => <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />)}
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-credit">
          <small>© {new Date().getFullYear()} Ótica Fernandes. Feito com cuidado em Pederneiras.</small>
          <small><Link href="/">Voltar ao início</Link></small>
        </div>
      </footer>
    </main>
  );
}
