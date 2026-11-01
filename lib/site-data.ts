import { supabase } from "./supabase";

export type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string | null;
  /** Todas as fotos cadastradas no painel, em ordem; a primeira é a capa (igual a image_url). */
  images?: string[];
  /** Texto opcional cadastrado no painel. */
  description?: string;
  /** Lojas com estoque deste produto. Ausente quando o estoque não está configurado. */
  available_at?: string[];
  /** Total de unidades somando todas as lojas. */
  stock_total?: number;
};

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export type SiteSettings = {
  hero_eyebrow: string;
  hero_text: string;
  story_text: string;
  story_years: string;
  hours_weekday: string;
  hours_saturday: string;
  whatsapp_number: string;
  whatsapp_message: string;
};

export type Store = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  photo: string;
};

export const stores: Store[] = [
  { id: "loja-1", name: "Loja 1", city: "Pederneiras", address: "Rua 9 de Julho, L-11 · Centro", phone: "(14) 3284-1693", whatsapp: "(14) 99904-1024", photo: "/stores/loja-1.jpg" },
  { id: "loja-2", name: "Loja 2", city: "Pederneiras", address: "Rua Coronel Coimbra, L-146 · Centro", phone: "(14) 3284-6179", whatsapp: "(14) 99904-0617", photo: "/stores/loja-2.jpg" },
  { id: "loja-3", name: "Loja 3", city: "Bauru", address: "Rua Rafael Pereira Martini, 11-73 · Jd. Redentor", phone: "(14) 3208-7770", whatsapp: "(14) 99179-4841", photo: "/stores/loja-3.jpg" },
];

export const contactLinks = {
  email: "fernandespederneiras@hotmail.com",
  instagram: { handle: "@optica.fernandes", url: "https://www.instagram.com/optica.fernandes" },
  facebook: { handle: "oticafernandes", url: "https://www.facebook.com/oticafernandes" },
};

const fallbackProducts: Product[] = [
  { id: "fallback-1", name: "Solar Acetato", type: "Óculos de sol", price: 289.9, image_url: "/otica-hero.png" },
  { id: "fallback-2", name: "Classic Gold", type: "Relógio feminino", price: 459.9, image_url: "/otica-hero.png" },
  { id: "fallback-3", name: "Brinco Luz", type: "Semijoia", price: 129.9, image_url: "/otica-hero.png" },
];

const fallbackGallery: GalleryImage[] = [
  { id: "fallback-1", url: "/gallery/fachada-portico.jpg", alt: "Pórtico vermelho na entrada da Ótica Fernandes" },
  { id: "fallback-2", url: "/gallery/salao-atendimento.jpg", alt: "Salão de atendimento com poltronas e expositores de óculos" },
  { id: "fallback-3", url: "/gallery/recepcao.jpg", alt: "Recepção com painel da Ótica Fernandes e parede verde" },
  { id: "fallback-4", url: "/gallery/vitrine-joias.jpg", alt: "Vitrine de vidro com joias e semijoias" },
  { id: "fallback-5", url: "/gallery/entrada-loja-2.jpg", alt: "Entrada da loja com tapete Fernandes e expositores" },
  { id: "fallback-6", url: "/gallery/parede-relogios.jpg", alt: "Parede de relógios Lince, Mondaine e outras marcas" },
  { id: "fallback-7", url: "/gallery/torres-orient.jpg", alt: "Torres de vidro com relógios Orient" },
  { id: "fallback-8", url: "/gallery/cantinho-criancas.jpg", alt: "Cantinho das crianças com mesa e cadeiras vermelhas" },
];

export const fallbackSettings: SiteSettings = {
  hero_eyebrow: "Desde 1976 em Pederneiras",
  hero_text: "Óculos, joias e relógios escolhidos para acompanhar a sua história, o seu ritmo e o seu jeito de ser.",
  story_text:
    "O que começou com um sonho de família se tornou uma referência em Pederneiras. Hoje, seguimos unindo atendimento próximo, curadoria cuidadosa e aquele olhar especial para encontrar o que combina com você.",
  story_years: "50",
  hours_weekday: "Segunda a sexta, 9h às 18h",
  hours_saturday: "Sábado, 9h às 13h",
  whatsapp_number: "5514999040617",
  whatsapp_message: "Olá! Gostaria de mais informações.",
};

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return fallbackProducts;
  // Banco ainda sem as colunas novas (description, images): tenta de novo sem elas
  const data =
    (await selectProducts("id, name, type, price, image_url, description, images")) ??
    (await selectProducts("id, name, type, price, image_url, description")) ??
    (await selectProducts("id, name, type, price, image_url"));
  if (!data || data.length === 0) return fallbackProducts;
  return withAvailability(data);
}

async function selectProducts(columns: string): Promise<Product[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .order("sort_order", { ascending: true })
    .returns<Product[]>();
  return error ? null : data;
}

/** Junta ao produto as lojas onde há estoque, cadastrado pelo painel (tabelas stores e product_stock). */
async function withAvailability(products: Product[]): Promise<Product[]> {
  if (!supabase) return products;
  const [storesResult, stockResult] = await Promise.all([
    supabase.from("stores").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("product_stock").select("product_id, store_id, quantity").gt("quantity", 0),
  ]);
  // Sem lojas cadastradas (ou tabelas ainda não criadas): o site segue sem informação de estoque
  if (storesResult.error || stockResult.error || !storesResult.data?.length) return products;

  const storeOrder = storesResult.data.map((store) => store.id);
  const storeNames = new Map(storesResult.data.map((store) => [store.id, store.name]));

  return products.map((product) => {
    const rows = stockResult.data
      .filter((row) => String(row.product_id) === String(product.id))
      .sort((a, b) => storeOrder.indexOf(a.store_id) - storeOrder.indexOf(b.store_id));
    return {
      ...product,
      available_at: rows.map((row) => storeNames.get(row.store_id)).filter((name): name is string => !!name),
      stock_total: rows.reduce((sum, row) => sum + row.quantity, 0),
    };
  });
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!supabase) return fallbackGallery;
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, url, alt")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fallbackGallery;
  return data;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return fallbackSettings;
  const { data, error } = await supabase.from("site_settings").select("*").single();
  if (error || !data) return fallbackSettings;
  return { ...fallbackSettings, ...data };
}
