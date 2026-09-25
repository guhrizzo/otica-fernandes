import { supabase } from "./supabase";

export type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string | null;
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
  { id: "fallback-1", url: "/gallery/loja-fachada.jpg", alt: "Fachada da Ótica Fernandes" },
  { id: "fallback-2", url: "/gallery/loja-balcao.jpg", alt: "Balcão de atendimento com óculos e relógios" },
  { id: "fallback-3", url: "/otica-loja.jpg", alt: "Parede de armações da Ótica Fernandes" },
  { id: "fallback-4", url: "/gallery/loja-vitrine-relogios.jpg", alt: "Vitrine com relógios em exposição" },
  { id: "fallback-5", url: "/gallery/loja-orient.jpg", alt: "Expositor de relógios Orient" },
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
  const { data, error } = await supabase
    .from("products")
    .select("id, name, type, price, image_url")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fallbackProducts;
  return data;
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
