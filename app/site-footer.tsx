import Image from "next/image";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { contactLinks, stores } from "@/lib/site-data";
import type { Store } from "@/lib/site-data";

// O lucide-react 1.x não traz mais ícones de marcas; estes seguem o mesmo traço dele.
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Logo da RizzoWeb redesenhado em vetor, sem o fundo escuro do arquivo original.
const RizzoWebLogo = () => (
  <svg className="rizzoweb-logo" width="20" height="21" viewBox="270 250 580 600" aria-hidden="true">
    <path fill="currentColor" d="M284 265H757L777 337L502 495H757L777 567L502 725H578V802H357L339 730L613 572H357L339 500L613 342H284Z" />
    <circle cx="764" cy="763" r="70" fill="#0d6efd" />
  </svg>
);

export const mapsUrl = (store: Store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Ótica Fernandes, ${store.address.replace(" · ", ", ")}, ${store.city}, SP`)}`;

export default function SiteFooter({ homeHref = "#inicio" }: { homeHref?: string }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="brand brand-footer" href={homeHref} aria-label="Ótica Fernandes, início"><Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} /></a>
        <div className="footer-col">
          <p className="label">Contato</p>
          <a href={`mailto:${contactLinks.email}`}><Mail size={18} aria-hidden /> <span>{contactLinks.email}</span></a>
          <a href={contactLinks.instagram.url} target="_blank" rel="noopener noreferrer"><InstagramIcon /> <span>{contactLinks.instagram.handle}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>
          <a href={contactLinks.facebook.url} target="_blank" rel="noopener noreferrer"><FacebookIcon /> <span>{contactLinks.facebook.handle}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>
        </div>
        <div className="footer-col">
          <p className="label">Lojas</p>
          {stores.map((store) => <a href={mapsUrl(store)} target="_blank" rel="noopener noreferrer" key={store.id}><MapPin size={18} aria-hidden /> <span>{store.name} · {store.city}</span> <ArrowUpRight className="footer-ext" size={14} aria-hidden /></a>)}
        </div>
      </div>
      <div className="footer-credit">
        <small>© {new Date().getFullYear()} Ótica Fernandes. Feito com cuidado em Pederneiras.</small>
        <small className="footer-dev">Desenvolvido por <a href="https://www.instagram.com/gfrizzo_/?hl=pt" target="_blank" rel="noopener noreferrer"><RizzoWebLogo /> <span>Gustavo Rizzo</span></a></small>
      </div>
    </footer>
  );
}
