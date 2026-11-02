import { ArrowUpRight } from "lucide-react";
import ProductPhotos from "./product-photos";
import type { Product } from "@/lib/site-data";

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const storeListFormatter = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

export default function ProductCard({ product, whatsappNumber }: { product: Product; whatsappNumber: string }) {
  const message = `Olá! Tenho interesse no ${product.name} (${priceFormatter.format(product.price)}).`;
  const images = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];

  return (
    <article className="product-card">
      <ProductPhotos images={images} name={product.name} />
      <div className="product-meta">
        <p>{product.type}</p>
        <h3>{product.name}</h3>
        {product.description && <p className="product-description">{product.description}</p>}
        <strong>{priceFormatter.format(product.price)}</strong>
        {product.available_at && (
          <span className={`product-stock${product.available_at.length === 0 ? " is-out" : ""}`}>
            {product.available_at.length === 0
              ? "Sob encomenda · consulte"
              : `${(product.stock_total ?? 0) <= 2 ? "Últimas unidades" : "Disponível"} na ${storeListFormatter.format(product.available_at)}`}
          </span>
        )}
      </div>
      <a className="product-ask" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
        Tenho interesse <ArrowUpRight size={15} />
      </a>
    </article>
  );
}
