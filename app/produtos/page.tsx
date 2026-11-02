import type { Metadata } from "next";
import { getProducts, getSiteSettings, getStoreHours } from "@/lib/site-data";
import ProdutosClient from "./produtos-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Produtos | Ótica Fernandes",
  description: "Veja todos os óculos, relógios, joias e semijoias da Ótica Fernandes e consulte a disponibilidade nas lojas de Pederneiras e Bauru.",
};

export default async function ProdutosPage() {
  const [products, settings, storeHours] = await Promise.all([getProducts(), getSiteSettings(), getStoreHours()]);
  return <ProdutosClient products={products} whatsappNumber={settings.whatsapp_number} whatsappMessage={settings.whatsapp_message} storeHours={storeHours} />;
}
