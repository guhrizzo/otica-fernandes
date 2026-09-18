import HomeClient from "./home-client";
import { getGalleryImages, getProducts, getSiteSettings } from "@/lib/site-data";

export const revalidate = 60;

export default async function Home() {
  const [products, galleryImages, settings] = await Promise.all([
    getProducts(),
    getGalleryImages(),
    getSiteSettings(),
  ]);

  return <HomeClient products={products} galleryImages={galleryImages} settings={settings} />;
}
