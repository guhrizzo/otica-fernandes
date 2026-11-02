import HomeClient from "./home-client";
import { getGalleryImages, getProducts, getSiteSettings, getStoreHours } from "@/lib/site-data";

export const revalidate = 60;

export default async function Home() {
  const [products, galleryImages, settings, storeHours] = await Promise.all([
    getProducts(),
    getGalleryImages(),
    getSiteSettings(),
    getStoreHours(),
  ]);

  return <HomeClient products={products} galleryImages={galleryImages} settings={settings} storeHours={storeHours} />;
}
